## mswap contract
### deploy
```shell
near contract deploy test-mcswap.muserquantity.testnet use-file ./res/mcswap.wasm with-init-call init json-args '{"owner_id":"muserquantity.testnet"}' prepaid-gas '100.000 TeraGas' attached-deposit '0 NEAR' network-config testnet sign-with-keychain send
```


### methods
1. make_swap_order
```shell
near contract call-function as-transaction test-mcswap.muserquantity.testnet make_swap_order json-args '{"swap_end":1694112528}' prepaid-gas '100.000 TeraGas' attached-deposit '0 NEAR' sign-as muserquantity.testnet network-config testnet sign-with-keychain send
```

2. get_swap_order_detail
```shell
near contract call-function as-read-only test-mcswap.muserquantity.testnet get_swap_order_detail json-args '{"order_id":1}' network-config testnet now
```

3. get_swap_order_list
```shell
