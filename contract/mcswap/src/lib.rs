mod ft;
mod nft;

use near_contract_standards::non_fungible_token::TokenId;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize}; // self 必须导入
use near_sdk::collections::{LookupMap, LookupSet};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, require, AccountId, BorshStorageKey, PanicOnDefault};

// 交换的token
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct SwapToken {
    contract_id: AccountId,
    balance: U128,
}
// 交换的nft
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct SwapNft {
    contract_id: AccountId,
    nft_id: TokenId,
}
// 交易组
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct SwapGroup {
    tokens: Vec<SwapToken>,
    nfts: Vec<SwapNft>,
}
// 交易详情
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct SwapOrderDetail {
    maker: AccountId,
    maker_swap_group: Option<SwapGroup>,
    taker: Option<AccountId>,
    taker_swap_group: Option<SwapGroup>,
    swap_end: u64,
    swap_status: u8, // 0: opened, 1: closed, 2: finished
}
// 请求详情
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct SwapRequestDetail {
    order_id: u128,
    taker: AccountId,
    taker_swap_group: Option<SwapGroup>,
    swap_end: u64,
    swap_status: u8, // 0: opened, 1: closed, 2: finished
}
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct McSwapContract {
    // 合约拥有者
    owner_id: AccountId,
    // 合约状态
    open: bool,
    // 黑名单，集合类型
    blacklist: LookupSet<AccountId>,
    // 交易列表
    // 全局订单数据
    swap_order_data: LookupMap<u128, SwapOrderDetail>,
    // 全局订单
    swap_order_list: Vec<u128>,
    user_order_list: LookupMap<AccountId, Vec<u128>>,
    swap_request_data: LookupMap<u128, SwapRequestDetail>,
    user_request_list: LookupMap<AccountId, Vec<u128>>,
    // 自增变量
    swap_order_id: u128,
    swap_request_id: u128,
}
#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    BlackList,
    SwapOrderData,
    SwapOrderList,
    UserOrderList,
    SwapRequestData,
    UserRequestList,
}
#[near_bindgen]
impl McSwapContract {
    #[init]
    pub fn init(owner_id: AccountId) -> Self {
        Self {
            owner_id: owner_id.clone(),
            open: true,
            blacklist: LookupSet::new(StorageKey::BlackList),
            swap_order_data: LookupMap::new(StorageKey::SwapOrderData),
            swap_order_list: Vec::new(),
            user_order_list: LookupMap::new(StorageKey::UserOrderList),
            swap_request_data: LookupMap::new(StorageKey::SwapRequestData),
            user_request_list: LookupMap::new(StorageKey::UserRequestList),
            swap_order_id: 0,
            swap_request_id: 0,
        }
    }

    // 发起交易
    pub fn make_swap_order(&mut self, swap_group: Option<SwapGroup>, swap_end: u64) {
        let caller = env::predecessor_account_id();
        // 检查caller是否被banned用contains方法
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        let swap_order_id = self.next_order_id();
        // if swap_group.is_some() {
        //     // 检查caller是否有足够的token
        //     let swap_group = swap_group.unwrap();
        //     for swap_token in swap_group.tokens {
        //         // 检查caller是否有足够的token
        //         let balance = ft::ft_balance_of(
        //             swap_token.contract_id.clone(),
        //             caller.clone(),
        //             env::current_account_id(),
        //             0,
        //             1_000_000_000_000_000,
        //         );
        //         require!(
        //             balance >= swap_token.balance,
        //             "Caller does not have enough token."
        //         );
        //     }
        //     // 检查caller是否有足够的nft
        //     for swap_nft in swap_group.nfts {
        //         // 检查caller是否有足够的nft
        //         let balance = nft::nft_supply_for_owner(
        //             swap_nft.contract_id.clone(),
        //             caller.clone(),
        //             env::current_account_id(),
        //             0,
        //             1_000_000_000_000_000,
        //         );
        //         require!(balance >= 1, "Caller does not have enough nft.");
        //     }
        // } else {
        //     // 检查caller是否有足够的token
        //     let balance = ft::ft_balance_of(
        //         env::current_account_id(),
        //         caller.clone(),
        //         env::current_account_id(),
        //         0,
        //         1_000_000_000_000_000,
        //     );
        //     require!(balance >= 1, "Caller does not have enough token.");
        // }
        if swap_group.is_none() {
            let _swap_group = SwapGroup {
                tokens: Vec::new(),
                nfts: Vec::new(),
            };
        }
        let swap_order_detail = SwapOrderDetail {
            maker: caller.clone(),
            maker_swap_group: swap_group,
            taker: None,
            taker_swap_group: None,
            swap_end,
            swap_status: 0,
        };
        self.swap_order_data
            .insert(&swap_order_id, &swap_order_detail);
        self.swap_order_list.push(swap_order_id);
        // 插入user_order_list
        // 获取用户订单列表，如果没有则创建一个空列表
        if self.user_order_list.get(&caller).is_none() {
            let user_order_list = Vec::new();
            self.user_order_list.insert(&caller, &user_order_list);
        }
        let mut user_order_list = self.user_order_list.get(&caller).unwrap();
        // 克隆订单id
        let order_id = swap_order_id;
        // 在列表结尾插入订单id
        user_order_list.push(order_id);
        // 写回存储
        self.user_order_list.insert(&caller, &user_order_list);
    }

    // 取消交易
    pub fn cancel_swap_order(&mut self, order_id: u128) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        let swap_order_detail = self.swap_order_data.get(&order_id).unwrap();
        require!(
            swap_order_detail.maker == caller,
            "Only the maker can cancel the order."
        );
        require!(
            swap_order_detail.swap_status == 0,
            "Only the opened order can be canceled."
        );
        // 把交易状态改为关闭
        let mut swap_order_detail = self.swap_order_data.get(&order_id).unwrap();
        swap_order_detail.swap_status = 1;
        self.swap_order_data.insert(&order_id, &swap_order_detail);
    }

    // 发起请求
    pub fn request_swap_order(
        &mut self,
        order_id: u128,
        swap_group: Option<SwapGroup>,
        swap_end: u64,
    ) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        let request_id = self.next_request_id();
        let swap_request_detail = SwapRequestDetail {
            order_id,
            taker: caller.clone(),
            taker_swap_group: swap_group,
            swap_end,
            swap_status: 0,
        };
        self.swap_request_data
            .insert(&request_id, &swap_request_detail);
        // 插入user_request_list
        let mut user_request_list = self.user_request_list.get(&caller).unwrap();
        user_request_list.push(request_id);
        self.user_request_list.insert(&caller, &user_request_list);
    }

    // 取消请求
    pub fn cancel_swap_request(&mut self, request_id: u128) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        let swap_request_detail = self.swap_request_data.get(&request_id).unwrap();
        require!(
            swap_request_detail.taker == caller,
            "Only the taker can cancel the request."
        );
        require!(
            swap_request_detail.swap_status == 0,
            "Only the opened request can be canceled."
        );
        // 把交易状态改为关闭
        let mut swap_request_detail = self.swap_request_data.get(&request_id).unwrap();
        swap_request_detail.swap_status = 1;
        self.swap_request_data
            .insert(&request_id, &swap_request_detail);
    }

    // 接受请求
    pub fn accept_swap_request(&mut self, request_id: u128) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        let swap_request_detail = self.swap_request_data.get(&request_id).unwrap();
        require!(
            swap_request_detail.swap_status == 0,
            "Only the opened request can be accepted."
        );
        // 把请求状态改为完成
        let mut swap_request_detail = self.swap_request_data.get(&request_id).unwrap();
        swap_request_detail.swap_status = 2;
        self.swap_request_data
            .insert(&request_id, &swap_request_detail);
        // 把交易状态改为完成
        let mut swap_order_detail = self
            .swap_order_data
            .get(&swap_request_detail.order_id)
            .unwrap();
        swap_order_detail.swap_status = 2;
        swap_order_detail.taker = Some(swap_request_detail.taker.clone());
        swap_order_detail.taker_swap_group = swap_request_detail.taker_swap_group.clone();
        let order_id = swap_request_detail.order_id;
        self.swap_order_data.insert(&order_id, &swap_order_detail);
    }

    // 查询交易列表
    pub fn get_swap_order_list(&self) -> Vec<u128> {
        self.swap_order_list.to_vec()
    }

    // 查询交易详情
    pub fn get_swap_order_detail(&self, order_id: u128) -> SwapOrderDetail {
        self.swap_order_data.get(&order_id).unwrap()
    }

    // 查询自发交易
    pub fn get_user_order_list(&self, account_id: AccountId) -> Vec<u128> {
        let user_order_list = self.user_order_list.get(&account_id).unwrap();
        user_order_list.to_vec()
    }

    // 查询自发请求
    pub fn get_user_request_list(&self, account_id: AccountId) -> Vec<u128> {
        let user_request_list = self.user_request_list.get(&account_id).unwrap();
        user_request_list.to_vec()
    }

    // 添加黑名单
    pub fn add_blacklist(&mut self, account_id: AccountId) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        // 检查caller是否是owner
        require!(self.owner_id == caller, "Only the owner can add blacklist.");
        // 检查account_id是否被banned
        require!(
            !self.blacklist.contains(&account_id),
            "Account is already banned."
        );
        self.blacklist.insert(&account_id);
    }

    // 设置合约状态
    pub fn set_open(&mut self, open: bool) {
        let caller: AccountId = env::predecessor_account_id();
        // 检查caller是否被banned
        require!(
            !self.blacklist.contains(&caller),
            "Caller is banned from the contract."
        );
        // 检查caller是否是owner
        require!(self.owner_id == caller, "Only the owner can set open.");
        self.open = open;
    }
}

impl McSwapContract {
    pub(crate) fn next_order_id(&mut self) -> u128 {
        self.swap_order_id += 1;
        self.swap_order_id
    }
    pub(crate) fn next_request_id(&mut self) -> u128 {
        self.swap_request_id += 1;
        self.swap_request_id
    }
}

#[cfg(test)] // 标注测试模块
mod test {
    use crate::McSwapContract;

    use near_sdk::env;

    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::{testing_env, AccountId};

    fn owner() -> AccountId {
        "owner.near".parse().unwrap()
    }

    fn alice() -> AccountId {
        "alice.near".parse().unwrap()
    }

    fn bob() -> AccountId {
        "bob.near".parse().unwrap()
    }

    fn carol() -> AccountId {
        "carol.near".parse().unwrap()
    }

    #[test]
    fn test_make_swap_order() {
        let mut contract = McSwapContract::init(owner());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(owner())
            .build());
        let swap_group = None;
        // 获取当前时间1天后的时间戳
        let swap_end = env::block_timestamp() + 86400;
        // alice发起交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        contract.make_swap_order(swap_group, swap_end);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 1);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 1);
        let order_id = swap_order_list[0];
        // alice取消交易
        contract.cancel_swap_order(order_id);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 1);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 1);
        let order_id = swap_order_list[0];
        contract.cancel_swap_order(order_id);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 1);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 1);
    }

    fn test_request_swap_order() {
        let mut contract = McSwapContract::init(owner());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(owner())
            .build());
        let swap_group = None;
        // 获取当前时间1天后的时间戳
        let swap_end = env::block_timestamp() + 86400;
        // alice发起交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        contract.make_swap_order(swap_group.clone(), swap_end);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 1);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 1);
        let order_id = swap_order_list[0];
        // bob请求交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(bob())
            .build());
        contract.request_swap_order(order_id, swap_group.clone(), swap_end);
        let user_request_list = contract.get_user_request_list(bob());
        assert_eq!(user_request_list.len(), 1);
        // carol请求交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(carol())
            .build());
        contract.request_swap_order(order_id, swap_group.clone(), swap_end);
        let user_request_list = contract.get_user_request_list(carol());
        assert_eq!(user_request_list.len(), 2);
        // alice取消交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        contract.cancel_swap_order(order_id);
        // 订单状态为关闭
        let _swap_order_list = contract.get_swap_order_list();
    }

    fn test_swap() {
        let mut contract = McSwapContract::init(owner());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(owner())
            .build());
        // alice发起交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        let swap_group = None;
        // 获取当前时间1天后的时间戳
        let swap_end = env::block_timestamp() + 86400;
        contract.make_swap_order(swap_group.clone(), swap_end);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 1);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 1);
        let order_id = swap_order_list[0];
        // bob请求交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(bob())
            .build());
        contract.request_swap_order(order_id, swap_group.clone(), swap_end);
        let user_request_list = contract.get_user_request_list(bob());
        assert_eq!(user_request_list.len(), 1);
        // alice接受请求
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        let request_id = user_request_list[0];
        contract.accept_swap_request(request_id);
        let user_request_list = contract.get_user_request_list(bob());
        assert_eq!(user_request_list.len(), 0);
        let user_order_list = contract.get_user_order_list(alice());
        assert_eq!(user_order_list.len(), 0);
    }

    fn test_add_blacklist() {
        let mut contract = McSwapContract::init(owner());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(owner())
            .build());
        // 把alice加入黑名单
        contract.add_blacklist(alice());
        // alice发起交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        let swap_group = None;
        // 获取当前时间1天后的时间戳
        let swap_end = env::block_timestamp() + 86400;
        contract.make_swap_order(swap_group.clone(), swap_end);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 0);
    }

    fn test_set_open() {
        let mut contract = McSwapContract::init(owner());
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(owner())
            .build());
        // 设置合约状态为关闭
        contract.set_open(false);
        // alice发起交易
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(alice())
            .build());
        let swap_group = None;
        // 获取当前时间1天后的时间戳
        let swap_end = env::block_timestamp() + 86400;
        contract.make_swap_order(swap_group.clone(), swap_end);
        let swap_order_list = contract.get_swap_order_list();
        assert_eq!(swap_order_list.len(), 0);
    }
}
