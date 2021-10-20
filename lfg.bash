go install ./...


# get child ready
child init child
child keys add child
child add-genesis-account child 10000000000000000stake
child gentx child 10000000000000000stake --chain-id child
child collect-gentxs

# Get parent ready
parent init parent
parent keys add parent
parent add-genesis-account parent 10000000000000000stake
parent gentx parent 10000000000000000stake --chain-id parent
parent collect-gentxs

# Get relayer ready
git clone https://github.com/informalsystems/ibc-rs
cd ibc-rs/relayer-cli

#Set Environment variables
export CHILD_P2P_LADDR=tcp://0.0.0.0:20000
export CHILD_RPC_LADDR=tcp://127.0.0.1:20001
export CHILD_GRPC_ADDRESS=127.0.0.1:20002
export CHILD_API_ADDRESS=tcp://127.0.0.1:20003
export CHILD_NODE=tcp://127.0.0.1:20001


export PARENT_P2P_LADDR=tcp://0.0.0.0:10000
export PARENT_RPC_LADDR=tcp://127.0.0.1:10001
export PARENT_GRPC_ADDRESS=127.0.0.1:10002
export PARENT_GRPC_WEB_ADDRESS=127.0.0.1:10004
export PARENT_API_ADDRESS=tcp://127.0.0.1:10003
export PARENT_NODE=tcp://127.0.0.1:10001


cargo install --path .
hermes keys restore child -m "panic birth ladder wild audit grocery poverty inhale police sport dad error summer ozone giggle witness bonus uncover arrest broccoli miss eyebrow tell belt"
hermes keys restore parent -m "empower lion curtain bitter immune human skin drip remember moon easy cat omit bubble anger item fetch broken bike naive leave one wish depart"
hermes client create parent child
hermes client create child parent


rly keys restore child child "panic birth ladder wild audit grocery poverty inhale police sport dad error summer ozone giggle witness bonus uncover arrest broccoli miss eyebrow tell belt"
rly keys restore parent parent "empower lion curtain bitter immune human skin drip remember moon easy cat omit bubble anger item fetch broken bike naive leave one wish depart"


hermes start
