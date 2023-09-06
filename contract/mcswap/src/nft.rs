use near_contract_standards::non_fungible_token::metadata::TokenMetadata;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::json_types::{U128, U64};
use near_sdk::{ext_contract, AccountId, PromiseOrValue};

// 声明 ft 合约的通用接口
#[ext_contract(nft_contract)]
pub trait NftContract {
    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: U64,
        memo: Option<String>,
    ) -> PromiseOrValue<U128>;
    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: U64,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128>;
    fn nft_token(&self, token_id: TokenId) -> Option<Token>;
    fn nft_total_supply(&self) -> U64;
    fn nft_tokens(&self, from_index: U64, limit: U64) -> Vec<Token>;
    fn nft_supply_for_owner(&self, account_id: AccountId) -> U64;
    fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: U64,
        limit: U64,
    ) -> Vec<Token>;
    fn nft_approve(
        &mut self,
        token_id: TokenId,
        account_id: AccountId,
        msg: Option<String>,
    ) -> bool;
    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId) -> bool;
    fn nft_revoke_all(&mut self, token_id: TokenId) -> bool;
    fn nft_is_approved(&self, token_id: TokenId, account_id: AccountId) -> bool;
    fn nft_approve_account_ids(&self, token_id: TokenId) -> Vec<AccountId>;
    fn nft_transfer_from(
        &mut self,
        owner_id: AccountId,
        new_owner_id: AccountId,
        token_id: TokenId,
        approval_id: U64,
        memo: Option<String>,
    ) -> PromiseOrValue<U128>;
    fn nft_transfer_from_call(
        &mut self,
        owner_id: AccountId,
        new_owner_id: AccountId,
        token_id: TokenId,
        approval_id: U64,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128>;
    fn nft_token_metadata(&self, token_id: TokenId) -> Option<TokenMetadata>;
    fn nft_token_metadata_by_index(&self, token_id: TokenId) -> Option<TokenMetadata>;
    fn nft_token_metadata_by_owner(&self, token_id: TokenId) -> Option<TokenMetadata>;
    fn nft_token_metadata_by_owner_and_index(&self, token_id: TokenId) -> Option<TokenMetadata>;
    // on
    fn nft_on_transfer(
        &mut self,
        sender_id: AccountId,
        token_id: TokenId,
        approval_id: U64,
        msg: String,
    ) -> bool;
    fn nft_on_approve(&mut self, token_id: TokenId, owner_id: AccountId, msg: String) -> bool;
}
