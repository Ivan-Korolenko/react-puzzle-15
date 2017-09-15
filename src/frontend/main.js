import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import css from './style.css';
import FlipMove from 'react-flip-move';

//Lang arrays
const langRu = {
    appAuthor: <div className="app-author">Создатель: <a target="_blank" href="https://ivankorolenko.com" className="app-author__link">Иван Короленко</a></div>,
    appHeader: "Пятнашки",
    movesCounter: "Ходы: ",
    timeCounter: "Потрачено секунд: ",
    winBlockHeader: "Победа!",
    winBlockButton: "Еще раз?"
};

const langEn = {
    appAuthor: <div className="app-author">Creator: <a target="_blank" href="https://ivankorolenko.com/en/" className="app-author__link">Ivan Korolenko</a></div>,
    appHeader: "15 Puzzle",
    movesCounter: "Moves: ",
    timeCounter: "Seconds spent: ",
    winBlockHeader: "Win!",
    winBlockButton: "Try again?"

};

/*------------------- FUNCTIONS -------------------*/

const langDefiner = () => {
    if(navigator.language === "ru") return langRu
    else return langEn
}

//Random array shuffling func
const shuffleArray = arr => arr = arr.sort((a, b) => Math.random() - 0.5);

/* 
Functions for obtaining the row number and column of an element in a two-dimensional array based on the index in a one-dimensional array
(works for any equilateral two-dimensional array)
*/
//Divide the number of the element in the array by the dimension of the array (the length of the line/column) and bring it to the nearest higher integer
const getRowNumber = (indexInArr, arrDimension) => Math.ceil((indexInArr)/arrDimension);
//If the index is larger than the dimension of the array (the element is not on the first line), then subtract the dimension multiplied by the line number minus one from the index, otherwise just give the index
const getColNumber = (indexInArr, arrDimension) => 
      indexInArr > arrDimension ? indexInArr - arrDimension*((Math.ceil((indexInArr)/arrDimension))-1) : indexInArr;

function startStateGenerator(size) {
    
    let startStateArr = [], i = 0;
    
    //Functions checks generated array for solvability in terms of Puzzle 15 rules
    function checkForSolvability(checkedArr) {
        
        let rowNumberOf16 = 0, 
            chaosParameter = 0;
        
        for (i = 0; i < checkedArr.length; i++) {
            
            //Find the number of elements in the array, standing after the current and smaller by its value. On every founded element increase the variable of chaos
            for (let j = i + 1; j < checkedArr.length; j++) {
                if (checkedArr[j] < checkedArr[i]) chaosParameter++;
            }
        }
        
        //Find the line number of the 16th element in the array using the rounding function to the nearest maximum integer (for example, 0.25 is rounded to 1)
        rowNumberOf16 = Math.ceil(((checkedArr.findIndex((elem) => elem === 16))+1)/4);
        
        //Add the line number of the 16th element to the chaos parameter
        chaosParameter += rowNumberOf16;
        
        //If the chaos parameter is even, then the problem is solved, if odd, then non-solvable
        if(chaosParameter%2 === 0)
            {
               return true; 
            }
        else {
            return false;
        }
    }

    //Filling array with indexes
    while (++i <= size) startStateArr.push(i);

    do {
        //Shuffling it
    startStateArr = shuffleArray(startStateArr);
        //Until we get the solvable one
    } while (checkForSolvability(startStateArr) !== true);

    return startStateArr;
    
}

/*------------------- FUNCTIONS END -------------------*/

/*------------------- COMPONENTS -------------------*/

const AppAuthor = props => <h1 className="app-author">{langDefiner().appAuthor}</h1>;

const AppHeader = props => <h1 className="app-h1">{langDefiner().appHeader}</h1>;

class WinMessage extends Component {
    constructor(props){
        super(props);
    }

   render() {
       return (
           <div className="win-block">
               <p className="win-block__header">{langDefiner().winBlockHeader}</p>
           </div>
       );
   }   
}

class Cell extends Component {
    constructor(props){
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    
    onClick(e) {
        this.props.onClick(e, this.props);
  }

  render() {
      return  this.props.cellGameNumber===16 ? 
          <div className="cell cell-16"></div> : 
          <div 
              className={this.props.positionCorrect === true ? "cell position-correct" : "cell"} 
              onClick={this.onClick}
          >
          {this.props.cellGameNumber}
      </div>;
  }
}

class MovesCounter extends Component {
    constructor(props){
        super(props);
    }
    
    render() {
        return  (<div className="moves-counter">{langDefiner().movesCounter}{this.props.moves}</div>);
    }
}

class TimeCounter extends Component {
    constructor(props){
        super(props);
    }
    
    render() {
        return  (<div className="time-counter">{langDefiner().timeCounter}{this.props.time}</div>);
    }
}

//Main component of the whole game   
class PuzzleGame extends Component {
    constructor(props){
        super(props);
        
        //Starting state of the game
        this.state = {
            //Call the function to create an array of cells and write the result in state
            tableStateNow: this.createCellsArray(),
            gameWinned: false,
            moves: 0,
            time: 0,
            showMessage: false
        };
    }
    
    addTimer() {
    this.setState(prevState => {
      return { time: prevState.time + 1 };
    });
  }

  setTimer() {
    this.timerId = setInterval(
      () => {
        this.addTimer();
      },
      1000,
    );
  }
    
    //Start the new game func
    refreshGame = () => {
        this.setState(function (prevState, props) {
                return {
                    tableStateNow: this.createCellsArray(),
                    gameWinned: false,
                    moves: 0,
                    time: 0,
                    showMessage: false
                }
            });
    }
    
    createCellsArray() {
        
      let size = this.props.size,
        cellsArray = [], i = 0, startStateChunk = [], j = 0;
    
        //Get an array of numbers that represents starting state of the game
        const startState = startStateGenerator(16);
          
      //Fill array with indexes
        while (++i <= size*size) cellsArray.push(i);
      
        //Fill it with real cells
        cellsArray = cellsArray.map(cell => 
                                    <Cell 
                                        key={cell} 
                                        cellLocation={cell} 
                                        cellGameNumber={startState[cell-1]} 
                                        positionCorrect={cell === startState[cell-1] ? true : false} 
                                        rowNumber={getRowNumber(cell, 4)}
                                        colNumber={getColNumber(cell, 4)}
                                        onClick={this.onCellClick}
                                        />); 
        return cellsArray;
    }
    
    onCellClick = (e, clickedCellProps) => {
        e.preventDefault();
            
            //If it's the first move, start time count
            if (this.state.moves === 0) {
                this.setTimer();
            }
            
        let isGameWinned = false; 

        //Get the state array of the table before the click, copy it to the array of the new state, find 16th and the clicked element in it , as well as their indexes
        let tableWas = this.state.tableStateNow,
            tableWillBe = tableWas.slice(),
            cell16Index = 0, clickedCellIndex = 0,
            cell16 = tableWas.find((element, index) => {
                cell16Index = index;
                return element.props.cellGameNumber === 16
            }),
            clickedCell = tableWas.find((element, index) => {
                clickedCellIndex = index;
                return element.props.cellGameNumber === clickedCellProps.cellGameNumber
            });
        
        //Get locational props for more convinient use in upcoming test
        let   c16R = cell16.props.rowNumber, 
              c16C = cell16.props.colNumber,
              ccR = clickedCell.props.rowNumber,
              ccC = clickedCell.props.colNumber,
            //Create elements, that will replace the current ones if the rules test will be passed, and updating their props accoring to the new state of things in the table
                newCell16 = React.cloneElement(cell16, {
                    cellLocation: clickedCell.props.cellLocation,
                    positionCorrect: clickedCell.props.cellLocation === cell16.props.cellGameNumber ? true : false,
                    rowNumber: clickedCell.props.rowNumber,
                    colNumber: clickedCell.props.colNumber
                }),
                newClickedCell = React.cloneElement(clickedCell, {
                    cellLocation: cell16.props.cellLocation,
                    positionCorrect: cell16.props.cellLocation === clickedCell.props.cellGameNumber ? true : false,
                    rowNumber: cell16.props.rowNumber,
                    colNumber: cell16.props.colNumber
                });

        /* 
        Rule check
             Permutation is always possible, if the following is observed:
                 1. one of the numbers in the location (row/column) of the clicked element coincides with one of the numbers in the 16th location
                 2. the second one is strictly greater or less than 16th by one
        */
        if (
        (c16R === ccR && ((c16C === (ccC + 1)) || (c16C === (ccC - 1)))) 
            || 
        (c16C === ccC && ((c16R === (ccR + 1)) || (c16R === (ccR - 1))))
        ) {
            //Swap cells in new state array
            tableWillBe[cell16Index] = newClickedCell;
            tableWillBe[clickedCellIndex] = newCell16;
            
            //Check for the game won. If all the cells in the new state of the table are in their places, then ...
            if(tableWillBe.length === tableWillBe.filter(element => element.props.positionCorrect === true).length) {
                //...notify the variable and stop time counting 
                isGameWinned = true;
                clearInterval(this.timerId);
            }
            
            this.setState(function (prevState, props) {
                return {
                    tableStateNow: tableWillBe,
                    moves: prevState.moves + 1,
                    gameWinned: isGameWinned
                }
            });
        }
      }
    
  render() {
      //Add a winning block when rendering if the game is won
      if (this.state.gameWinned !== true) {
          return (
            <FlipMove duration={500} appearAnimation="elevator" leaveAnimation="elevator">
                {/*Render cells array written in state of this component*/}
                <FlipMove duration={300} appearAnimation="elevator" leaveAnimation="elevator" className="table">
                    { this.state.tableStateNow }
                </FlipMove>
                  <div className="counters">
                    <MovesCounter moves={ this.state.moves }/>
                    <TimeCounter time={ this.state.time }/>
                  </div>
            </FlipMove>
          );
      }
      else {
          return ( 
              <FlipMove duration={500} appearAnimation="elevator" leaveAnimation="elevator">
                {/*Render cells array written in state of this component*/}
                <FlipMove duration={300} appearAnimation="elevator" leaveAnimation="elevator" className="table">
                    { this.state.tableStateNow }
                </FlipMove>
                <div className="counters">
                    <MovesCounter moves={ this.state.moves }/>
                    <TimeCounter time={ this.state.time }/>
                  </div>
                <WinMessage />
                <button className="win-block__button" onClick={this.refreshGame}>{langDefiner().winBlockButton}</button>
            </FlipMove>
          );
      }
  }     
}

class App extends Component {
    constructor(props){
        super(props);
    }
 
  render() {
    return (
        <div className="app column white">
            <AppAuthor />
                <AppHeader />
                <div className="table-container">
                    <PuzzleGame size="4" />
                </div>
            </div>
    );

  }
}

/*------------------- COMPONENTS END-------------------*/

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
