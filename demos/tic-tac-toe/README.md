This game is a distributed system that requires exactly two nodes to work. There is no central server, and no persistence mechanism (localstorage/cookies/etc). The state of the game is replicated across both nodes. If one node crashes and reconnects later, the surviving node will restore its state.

The game's business logic is implemented in fewer than 200 lines of code using [Conflux](https://github.com/ben-ng/conflux). The user interface is a simple React component. In this demo, Player 1 always starts the game. Try modifying the code to alternate who goes first!
