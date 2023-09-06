use near_contract_standards::non_fungible_token::events::{NftBurn, NftMint};
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{NonFungibleToken, Token, TokenId};
use near_contract_standards::{
    impl_non_fungible_token_approval, impl_non_fungible_token_core,
    impl_non_fungible_token_enumeration,
};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::{
    env, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue,
};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    owner_id: AccountId,
    tokens: NonFungibleToken,

    // 使用全局自增 id 作为 NFT id
    unique_id: u64,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    TokenMetadata, ·34568    Enumeration,
    Approval,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn init(owner_id: AccountId) -> Self {
        Self {
            owner_id: owner_id.clone(),
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            unique_id: 0,
        }
    }

    // 合约所有者能为任意用户 mint NFT
    pub fn mint(&mut self, account_id: AccountId, metadata: TokenMetadata, memo: Option<String>) {
        require!(
            env::predecessor_account_id() == self.owner_id,
            "Only contract owner can call this method."
        );
        let token_id = self.next_id().to_string();
        self.internal_mint(&account_id, &token_id, &metadata, memo);
    }

    // 合约所有者能为任意用户 burn NFT
    pub fn burn(&mut self, account_id: AccountId, token_id: TokenId, memo: Option<String>) {
        require!(
            env::predecessor_account_id() == self.owner_id,
            "Only contract owner can call this method."
        );
        self.internal_burn(&account_id, &token_id, memo);
    }
}

// 为合约实现 NEP171
// nft_transfer
// nft_transfer_call
// nft_token
// nft_resolve_transfer
impl_non_fungible_token_core!(Contract, tokens);

// 为合约实现 NEP178
// nft_approve
// nft_revoke
// nft_revoke_all
// nft_is_approved
impl_non_fungible_token_approval!(Contract, tokens);

// 为合约实现 NEP181
// nft_total_supply
// nft_tokens
// nft_supply_for_owner
// nft_tokens_for_owner
impl_non_fungible_token_enumeration!(Contract, tokens);

// 为合约实现 NEP177
#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "Hello Non Fungible Token".to_string(),
            symbol: "HelloNFT".to_string(),
            icon: None,
            base_uri: None,
            reference: None,
            reference_hash: None,
        }
    }
}

// ------------------------------------- 合约内部方法 ------------------------------------------------

impl Contract {
    pub(crate) fn next_id(&mut self) -> u64 {
        self.unique_id += 1;
        self.unique_id
    }

    pub(crate) fn internal_mint(
        &mut self,
        account_id: &AccountId,
        token_id: &TokenId,
        metadata: &TokenMetadata,
        memo: Option<String>,
    ) {
        // 添加 token_id -> token_owner_id 映射
        self.tokens.owner_by_id.insert(token_id, account_id);

        // 更新或添加 token_owner_id -> token_ids 映射
        if let Some(tokens_per_owner) = &mut self.tokens.tokens_per_owner {
            let mut owner_tokens = tokens_per_owner.get(account_id).unwrap_or_else(|| {
                UnorderedSet::new(
                    near_contract_standards::non_fungible_token::core::StorageKey::TokensPerOwner {
                        account_hash: env::sha256(account_id.as_bytes()),
                    },
                )
            });
            owner_tokens.insert(token_id);
            tokens_per_owner.insert(account_id, &owner_tokens);
        }

        // 添加 token_id -> token_metadata 映射
        if let Some(token_metadata_by_id) = &mut self.tokens.token_metadata_by_id {
            token_metadata_by_id.insert(token_id, metadata);
        }

        // 打印标准 log
        NftMint {
            owner_id: account_id,
            token_ids: &[token_id],
            memo: memo.as_deref(),
        }
        .emit();
    }

    pub(crate) fn internal_burn(
        &mut self,
        account_id: &AccountId,
        token_id: &TokenId,
        memo: Option<String>,
    ) {
        // 移除 token_id -> token_owner_id 映射
        self.tokens.owner_by_id.remove(token_id);

        // 更新或移除 token_owner_id -> token_ids 映射
        if let Some(tokens_per_owner) = &mut self.tokens.tokens_per_owner {
            if let Some(mut owner_tokens) = tokens_per_owner.remove(account_id) {
                owner_tokens.remove(token_id);
                if !owner_tokens.is_empty() {
                    tokens_per_owner.insert(account_id, &owner_tokens);
                }
            }
        };

        // 移除 token_id -> token_metadata 映射
        if let Some(token_metadata_by_id) = &mut self.tokens.token_metadata_by_id {
            token_metadata_by_id.remove(token_id);
        }

        // 移除 token_id -> approval_ids 映射
        if let Some(approvals_by_id) = &mut self.tokens.approvals_by_id {
            approvals_by_id.remove(token_id);
        }

        // 移除 token_id -> next_approval_id 映射
        if let Some(next_approval_id_by_id) = &mut self.tokens.next_approval_id_by_id {
            next_approval_id_by_id.remove(token_id);
        }

        // 打印标准 log
        NftBurn {
            owner_id: account_id,
            token_ids: &[token_id],
            authorized_id: Some(account_id),
            memo: memo.as_deref(),
        }
        .emit();
    }
}
