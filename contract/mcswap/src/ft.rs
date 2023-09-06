use near_sdk::json_types::U128;
use near_sdk::{ext_contract, AccountId, PromiseOrValue};

// 声明 ft 合约的通用接口
#[ext_contract(ft_contract)]
pub trait FtContract {
    fn ft_transfer(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
    ) -> PromiseOrValue<U128>;
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128>;
    fn ft_total_supply(&self) -> U128;
    fn ft_balance_of(&self, account_id: AccountId) -> U128;
    fn ft_resolve_transfer(&mut self, token_id: U128) -> PromiseOrValue<U128>;
    // storage
    fn storage_deposit(&mut self, account_id: AccountId) -> PromiseOrValue<U128>;
    fn storage_withdraw(&mut self, amount: U128) -> PromiseOrValue<U128>;
    fn storage_unregister(&mut self, account_id: AccountId);
    fn storage_balance_bounds(&self) -> (U128, U128);
    fn storage_balance_of(&self, account_id: AccountId) -> U128;
}
