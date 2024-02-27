// Logic building explanation taken from - https://www.ayweb.dev/blog/building-a-house-from-the-inside-out

function Playground() {
    const totalRows = 3;
    const totalColumns = 3;
    const playGroundBoardData = [];

    for(let i=0; i<totalRows; i++) {
        playGroundBoardData[i] = [];

        for(let j=0; j<totalColumns; j++) {
            playGroundBoardData[i].push(Cell());
        }
    }

    const getBoardData = () => playGroundBoardData;

    const placeMarkerInArr = (cell, playerMarker) => {
        let row, col ;

        switch(cell) {
            case 0: row = 0; col = 0; break;
            case 1: row = 0; col = 1; break;
            case 2: row = 0; col = 2; break;
            case 3: row = 1; col = 0; break;
            case 4: row = 1; col = 1; break;
            case 5: row = 1; col = 2; break;
            case 6: row = 2; col = 0; break;
            case 7: row = 2; col = 1; break;
            case 8: row = 2; col = 2; break;
        }

        playGroundBoardData[row][col].addMarker(playerMarker);
    };

    return {getBoardData, placeMarkerInArr};
}

function Cell() {
    let markerValue = "";

    const addMarker = (playerMarker) => {
        markerValue = playerMarker;
    };

    const getMarker = () => markerValue;

    return {addMarker, getMarker};
}


function GameController() {

    const playGroundBoard = Playground();

    const players = [
        {
            playerName: "Player 1",
            marker: "O",
            placedMarkers: []
        },
        {
            playerName: "Player 2",
            marker: "X",
            placedMarkers: []
        }
    ];

    let activePlayer = players[0];

    let switchPlayerTurn = () => {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    }

    const getActivePlayer = () => activePlayer;


    const playRound = (cell) => {

        const winConditions = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ];

        playGroundBoard.placeMarkerInArr(cell, getActivePlayer().marker);
        getActivePlayer().placedMarkers.push(cell);

        //Winning Condition
        let currentPlayerMarkers = getActivePlayer().placedMarkers;
        for(let i=0; i<winConditions.length; i++){
            let threeInARow = 0;
            for(let j=0; j<currentPlayerMarkers.length; j++){
                if(winConditions[i].includes(currentPlayerMarkers[j])){
                    threeInARow++;
                }
            }
            if(threeInARow === 3) {
                return getActivePlayer();
            }
        }

        switchPlayerTurn();
    }


    return {
        getActivePlayer, 
        playRound, 
        playGroundBoard: playGroundBoard.getBoardData
    };
}


function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector(".player-turn");
    const playGroundDiv = document.querySelector(".playground");

    const playerTurnCSS = (player) => {
        if(player.marker === "O") {
            playerTurnDiv.setAttribute('style', 'color: #970005; text-align: left');
        } else {
            playerTurnDiv.setAttribute('style', 'color: #000052; text-align: right');
        }
    }

    //clears the board first then print the board again with new values according to playGroundBoardData Array
    const updateBoard = () => {
        playGroundDiv.textContent = ""; //to clear the board

        let gameBoardArr = game.playGroundBoard();
        let currentPlayer = game.getActivePlayer();
        playerTurnCSS(currentPlayer);
        playerTurnDiv.textContent = `${currentPlayer.playerName}'s turn ...`;

        let cellNumIndex = 0, disabledBtns = 0;
        // Render board squares
        gameBoardArr.forEach(row => {
            row.forEach((cell) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the column
                // This makes it easier to pass into our `playRound` function 
                cellButton.dataset.cellNum = cellNumIndex;  
                cellNumIndex++;
                if(cell.getMarker() === "O") {
                    cellButton.style.color = "#970005"
                } else {
                    cellButton.style.color = "#000052"
                }
                cellButton.textContent = cell.getMarker();
                //If any marker is placed disable that button so that it doesnot get modified again
                if(cell.getMarker()) {
                    cellButton.disabled = true;
                    disabledBtns++;
                }
                playGroundDiv.appendChild(cellButton);
            })
        });

        if(disabledBtns === 9) {
            playerTurnDiv.textContent = "DRAW MATCH !!"
        }
    }
    
    
    //Adding Click Event Listener
    playGroundDiv.addEventListener('click', (e) => {
        //We are assigned number to data attribute but it will always convert that to a string value bcoz all CSS attributes have string datatype values
        const selectedCell = e.target.dataset.cellNum;
        //Make sure I have clicked a cell and not the gaps in between
        if(!selectedCell) return;

        let winner = game.playRound(+selectedCell);
        updateBoard();
        if(winner) {
            playerTurnCSS(winner);
            playerTurnDiv.textContent = `${winner.playerName} WON 🎉🎉`;
            const btnsArr = document.querySelectorAll(".cell");
            btnsArr.forEach((btn) => {
                btn.disabled = true;
            })
        }

    });

    //Initial render
    updateBoard();

}

ScreenController();