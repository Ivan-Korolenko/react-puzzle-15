import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import css from './style.css';
import FlipMove from 'react-flip-move';

//Языковые массивы
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

/*------------------- Функции -------------------*/

//Функция определения языка
//Изменить на реальное определение
const langDefiner = () => {
    if(navigator.language === "ru") return langRu
    else return langEn
}

//Функция перемешивания массива
const shuffleArray = arr => arr = arr.sort((a, b) => Math.random() - 0.5);

/* 
Функции получения номера строки и столбца элемента в двумерном массиве на основе индекса в одномерном массиве
(работают для любого равностороннего двумерного массива)
*/
//Делим номер элемента в массиве на измерение массива (длина строки/колонки) и приводим к ближайшему высшему целому числу
const getRowNumber = (indexInArr, arrDimension) => Math.ceil((indexInArr)/arrDimension);
//Если индекс больше измерения массива (элемент находится не на первой строке), то вычитаем из индекса измерение, умноженное на номер строки минус единица, иначе просто отдаем индекс 
const getColNumber = (indexInArr, arrDimension) => 
      indexInArr > arrDimension ? indexInArr - arrDimension*((Math.ceil((indexInArr)/arrDimension))-1) : indexInArr;

//Функция генерации массива исходного состяния
function startStateGenerator(size) {
    
    //Массив стартовых значений
    let startStateArr = [], i = 0;
    
    //Функция проверки на решаемость
    function checkForSolvability(checkedArr) {
        
        let rowNumberOf16 = 0, 
            chaosParameter = 0;
        
        //Перебираем все элементы проверяемого массива
        for (i = 0; i < checkedArr.length; i++) {
            
            //Находим количество элементов в массиве, стоящих после текущего и меньших его по значению. При нахождении увеличиваем переменную хаоса
            for (let j = i + 1; j < checkedArr.length; j++) {
                if (checkedArr[j] < checkedArr[i]) chaosParameter++;
            }
        }
        
        //Находим номер строки 16-го элемента в массиве с помощью функции округления до ближайшего максимального целого (например, 0.25 округляется до 1)
        rowNumberOf16 = Math.ceil(((checkedArr.findIndex((elem) => elem === 16))+1)/4);
        
        //Прибавляем номер строки 16-го элемента к параметру хаотичности
        chaosParameter += rowNumberOf16;
        
        //Если параметр хаотичности четный, то задача решаема, если нечетный, то нерешаема
        if(chaosParameter%2 === 0)
            {
               return true; 
            }
        else {
            return false;
        }
    }

    //Заполняем стартовый массив значениями по порядку
    while (++i <= size) startStateArr.push(i);

    do {
        //Перемешиваем массив
    startStateArr = shuffleArray(startStateArr);
        //Пока не получаем решаемый
    } while (checkForSolvability(startStateArr) !== true);

    return startStateArr;
    
}

/*------------------- Функции END -------------------*/

/*------------------- Компоненты -------------------*/

//Компонент информации об авторе
const AppAuthor = props => <h1 className="app-author">{langDefiner().appAuthor}</h1>;

//Компонент заголовка приложения
const AppHeader = props => <h1 className="app-h1">{langDefiner().appHeader}</h1>;

//Компонент сообщения о победе
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


//Компонент ячейки таблицы
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

//Компонент счетчика ходов
class MovesCounter extends Component {
    constructor(props){
        super(props);
    }
    
    render() {
        return  (<div className="moves-counter">{langDefiner().movesCounter}{this.props.moves}</div>);
    }
}

//Компонент счетчика времени
class TimeCounter extends Component {
    constructor(props){
        super(props);
    }
    
    render() {
        return  (<div className="time-counter">{langDefiner().timeCounter}{this.props.time}</div>);
    }
}

//Компонент игры    
class PuzzleGame extends Component {
    constructor(props){
        super(props);
        
        //Изначальное состояние игры
        this.state = {
            //вызываем функцию создания массива ячеек и записываем результат в state
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
    
    //Запуск новой игры
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
        //Получаем количество строк и столбцов в создаваемой таблице из переданного параметра
      let size = this.props.size,
        cellsArray = [], i = 0, startStateChunk = [], j = 0;
    
        //Получаем начальное состояние таблицы
        const startState = startStateGenerator(16);
          
      //Создаем массив строк с пустышками
        while (++i <= size*size) cellsArray.push(i);
      
        //Заполняем массив реальными ячейками
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
    
    
    //Событие клика по ячейке
    onCellClick = (e, clickedCellProps) => {
        e.preventDefault();
            
            //Если это первый ход, то запустить подсчет времени
            if (this.state.moves === 0) {
                this.setTimer();
            }
            
        let isGameWinned = false; 

        //Получаем массив состояния таблицы при клике, копируем его в массив нового состояния, находим в нем 16-й и кликнутый элемент, а также их индексы
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
        
        //Берем локационные props для краткости и удобства записи в проверке
        let   c16R = cell16.props.rowNumber, 
              c16C = cell16.props.colNumber,
              ccR = clickedCell.props.rowNumber,
              ccC = clickedCell.props.colNumber,
            //Создаем элементы, которые заменят имеющиеся при прохождении проверки на правила, с обвнолением props
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
        Делаем проверку по правилам
            Перестановка возможна всегда, если соблюдено:
                1. одно из чисел в локации (строка/столбец) кликнутого элемента совпадает с одним из чисел у 16-го
                2. второе на единицу строго больше или меньше 
        */
        if (
        (c16R === ccR && ((c16C === (ccC + 1)) || (c16C === (ccC - 1)))) 
            || 
        (c16C === ccC && ((c16R === (ccR + 1)) || (c16R === (ccR - 1))))
        ) {
            //Меняем ячейки местами в массиве нового состояния
            tableWillBe[cell16Index] = newClickedCell;
            tableWillBe[clickedCellIndex] = newCell16;
            
            //Проверка на выигранную игру. Если все ячейки в новом состоянии таблицы на своих местах, то...
            if(tableWillBe.length === tableWillBe.filter(element => element.props.positionCorrect === true).length) {
                //Уведомляем об этом переменную и останавливаем подсчет времени
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
      //Добавляем блок победы при рендеринге, если игра выиграна
      if (this.state.gameWinned !== true) {
          return (
            <FlipMove duration={500} appearAnimation="elevator" leaveAnimation="elevator">
                {/*Рендерим массив ячеек, записанный в state*/}
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
                {/*Рендерим массив ячеек, записанный в state*/}
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

//Компонент приложения
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

/*------------------- Компоненты END-------------------*/

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
