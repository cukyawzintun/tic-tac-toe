angular
    .module("TicTacToe", [])
    .controller("TicTacToeController", TicTacToeController);

TicTacToeController.$inject= ['$scope','$timeout'];

function TicTacToeController($scope, $timeout) {
  var vm = this;
  var globals = {};
  vm.choosePlayer = true;
  vm.level = false;
  vm.board = false;
  vm.gameLevel = null;
  vm.initialState = false;
  vm.winCount = vm.lostCount = vm.drawCount = 0;
  var content=null;
  vm.player = false;
  vm.turn = '';
  vm.count = 0;
  var gameBoard = [];

  vm.selectPlayer = function(player) {
    if(player == 'one'){
      vm.choosePlayer = false;
      vm.level = true;
    }else{
      gameBoard = ['E','E','E','E','E','E','E','E','E'];
      vm.player = true;
      vm.choosePlayer = false;
      vm.board = true;
      vm.level = false;
    }
  }
  vm.back = function(type) {
    vm.choosePlayer = true;      
    vm.level = false;
  }
  vm.play = function(level) {
    vm.board = true;
    vm.level = false;
    vm.gameLevel = level;
    var aiPlayer = new AI(level);
    globals.game = new Game(aiPlayer);
    aiPlayer.plays(globals.game);
    globals.game.start();
  }

  vm.move = function(indx) {
    if(!vm.player){
      if(globals.game.status == 'running' && globals.game.currentState.turn == 'X' && !$('#index-'+indx).hasClass('occupied')){
        var next = new State(globals.game.currentState);
        next.board[indx] = 'X';
        next.advanceTurn();
        styleMovedCell(indx, 1);
        globals.game.advanceTo(next);
      }
    }else{
      if(!$('#index-'+indx).hasClass('occupied')){
        if(vm.count % 2 == 0){
          gameBoard[indx] = 'X';
          styleMovedCell(indx, 1);
          if(finalResult(gameBoard,'two player')){
            $('#g-board div').addClass('occupied');
            showPlayerTurnPrompt('Game Over');
          }else{
            showPlayerTurnPrompt('Player 2 turn');
          }
        }else{
          gameBoard[indx] = 'O';
          styleMovedCell(indx, 2, 'O');
          if(finalResult(gameBoard,'two player')){
            $('#g-board div').addClass('occupied');
            showPlayerTurnPrompt('Game Over');
          }else{
            showPlayerTurnPrompt('Player 1 turn');
          }        
        }
        vm.count += 1;
      }
    }
  }

  vm.home = function() {
    globals = {};
    vm.choosePlayer = true;
    vm.level = false;
    vm.playerType = false;
    vm.board = false;
    vm.turn = null;
    vm.gameLevel = null;
    vm.computerTurn = null;
    vm.initialState = false;
    content=null;
    vm.winCount = vm.lostCount = vm.drawCount = 0;
    vm.player = false;
    vm.count = 0;
    gameBoard = [];
  }

  vm.restart = function(){
    $(".cell").empty();
    $("div").removeClass('occupied');
    $("div").removeClass('result-bg');
    var aiPlayer = new AI(vm.gameLevel);
    globals.game = new Game(aiPlayer);
    aiPlayer.plays(globals.game);
    globals.game.start();
    gameBoard = ['E','E','E','E','E','E','E','E','E'];        
  };
  
  var State = function(oldState) {
    this.turn = '';
    this.oMovesCount = 0;
    this.result = 'still running';
    this.board = []
    
    if(oldState !== undefined) {
      var len = oldState.board.length;
      this.board = new Array(len);
      for(var i=0; i < len; i++) {
        this.board[i] = oldState.board[i];
      }
      this.turn = oldState.turn;
      this.result = oldState.result;
      this.oMovesCount = oldState.oMovesCount;
    }
    
    this.advanceTurn = function() {
      this.turn = this.turn === 'X' ? 'O' : 'X';
    }
    
    this.isEmptyCells = function() {
      var indxs = [];
      for(var j=0; j < 9; j++) {
        if(this.board[j] == 'E') {
          indxs.push(j);
        }
      }
      return indxs;
    }
    
    this.isTerminal = function() {
      var B = this.board;
      
      for(var i=0; i<=6; i = i+3) {
        if(B[i] !== "E" && B[i] === B[i+1] && B[i+1] === B[i+2]){
          this.result = B[i] + '-won';
          return true;
        }
      }
      
      for(var i=0; i<=2; i++) {
        if(B[i] !== 'E' && B[i] === B[i+3] && B[i+3] === B[i+6]) {
          this.result = B[i] + '-won';
          return true;
        }
      }
      
      for(var i=0,j=4; i<=2; i=i+2,j=j-2) {
        if(B[i] !== 'E' && B[i] === B[i+j] && B[i+j] === B[i+2*j]){
          this.result = B[i] + '-won';
          return true;
        }
      }
      
      var available = this.isEmptyCells();
      if(available.length === 0) {
        this.result = 'draw';
        return true;
      }else {
        return false;
      }
      
    };
  } ;//end of State class
  
  var AI = function(level) {
     var levelOfIntelligence = level;
     var game = {};
     
     function minimaxValue(state){
       if(state.isTerminal()){
         return Game.score(state)
       }else{
         var stateScore;
         if(state.turn === 'X'){
           stateScore = -1000;
         }else{
           stateScore = 1000;
         }
         
         var availablePositions = state.isEmptyCells();
         var availableNextStates = availablePositions.map(function(pos){
           var action = new AIAction(pos);
           var nextState = action.applyTo(state);
           return nextState;
         });
         
         availableNextStates.forEach(function(nextState){
           var nextScore = minimaxValue(nextState);
           if(state.turn === 'X'){
             if(nextScore > stateScore){
               stateScore = nextScore;
             }
           }else{
             if(nextScore < stateScore){
               stateScore = nextScore;
             }
           }
         });
         return stateScore;
       }
       
     }
     
     function takeABlindMove(turn){
       var available = game.currentState.isEmptyCells();
       var randomCell = available[Math.floor(Math.random() * available.length)];
       var action = new AIAction(randomCell);
       var next = action.applyTo(game.currentState);
       
      //  ui.insertAt(randomCell, turn);
       styleMovedCell(randomCell, 2, turn)
       game.advanceTo(next);
     }
     
     function takeANoviceMove(turn){
       var available = game.currentState.isEmptyCells();
       
       var availableActions = available.map(function(pos){
         var action = new AIAction(pos);
         var nextState = action.applyTo(game.currentState);
         action.minimaxVal = minimaxValue(nextState);
         
         return action;
       })
       
       if(turn === 'X'){
         availableActions.sort(AIAction.DESCENDING);
       }else{
         availableActions.sort(AIAction.ASCENDING);
       }
       
       var chosenAction;
       if(Math.random*100 <= 40){
         chosenAction = availableActions[0];
       }else{
         if(availableActions.lenght >= 2){
           chosenAction = availableActions[1];
         }else{
           chosenAction = availableActions[0];
         }
       }
       
       var next = chosenAction.applyTo(game.currentState);
       styleMovedCell(chosenAction.movePosition, 2, turn)
       game.advanceTo(next);
     }
     
     function takeAMasterMove(turn){
       var available = game.currentState.isEmptyCells();
       var availableActions = available.map(function(pos){
         var action = new AIAction(pos);
         var next = action.applyTo(game.currentState);
         action.minimaxVal = minimaxValue(next);
         return action;
       });
       
       if(turn === 'X'){
         availableActions.sort(AIAction.DESCENDING);
       }else{
         availableActions.sort(AIAction.ASCENDING);
       }
       
       var chosenAction = availableActions[0];
       var next = chosenAction.applyTo(game.currentState);
       styleMovedCell(chosenAction.movePosition, 2, turn)     
       game.advanceTo(next);
     }
     
     this.plays = function(_game){
       game = _game;
     };
     
     this.notify = function(turn){
       switch(levelOfIntelligence){
        case 'easy': takeABlindMove(turn); break;
        case 'normal': takeANoviceMove(turn); break;
        case 'hard': takeAMasterMove(turn); break;   
       }
     };
   };//end of AI class
   
   var AIAction = function(pos){
     this.movePosition = pos;
     this.minimaxVal = 0;
     
     this.applyTo = function(state){
       var next = new State(state);
       next.board[this.movePosition] = state.turn;
       if(state.turn === 'O'){
         next.oMovesCount++;
       }
       next.advanceTurn();
       return next;
     }
   } //end of AIAction class
   
   AIAction.ASCENDING = function(first, second){
     if(first.minimaxVal < second.minimaxVal){
       return -1;
     }else if(first.minimaxVal > second.minimaxVal){
       return 1;
     }else{
       return 0;
     }
   }
   
   AIAction.DESCENDING = function(first, second){
     if(first.minimaxVal < second.minimaxVal){
       return 1;
     }else if(first.minimaxVal > second.minimaxVal){
       return -1;
     }else{
       return 0;
     }
   }
   
   var Game = function(autoplayer){
     this.ai = autoplayer;
     this.currentState = new State();
     this.currentState.board = ['E','E','E','E','E','E','E','E','E'];
     this.currentState.turn = 'X';
     this.status = 'beginning';
     
     this.advanceTo = function(_state){
       this.currentState = _state;
       if(_state.isTerminal()){
         this.status = 'ended';
         showPlayerTurnPrompt('Game Over')
         if(_state.result === 'X-won'){
           //X won
           //Won
           vm.winCount += 1;
           finalResult(_state.board);
           showMessage('.win-message');
         }else if(_state.result === 'O-won'){
           //O won
           //lost
           vm.lostCount += 1;
           finalResult(_state.board);
           showMessage('.lose-message');
         }else{
           //draw
           vm.drawCount += 1;
           showMessage('.draw-message');
         }
       }else{
         if(this.currentState.turn === 'X'){
           //your turn
          //  vm.turn = 'Your turn...';
           showPlayerTurnPrompt('Your turn');
         }else{
           //computer turn
          //  vm.turn = 'Computer turn...';
          var _this = this;
           showPlayerTurnPrompt('Computer\'s turn');       
           setTimeout(function(){
             _this.ai.notify('O');
           }, 1000)
         }
       }
     }
     
     this.start = function(){
       if(this.status === 'beginning'){
         this.advanceTo(this.currentState);
         this.status = 'running';
       }
     }
   };// end of Game class
  
   Game.score = function(_state){
     if(_state.result !== 'still running'){
      if(_state.result === 'X-won'){
        //x player win
        return 10 - _state.oMovesCount;
      }else if(_state.result === 'O-won'){
        //x player lost
        return -10 + _state.oMovesCount;
      }else{
        //it is draw
        return 0;
      }
     }
   }//end of score

  function showMessage(className, whoWin) {
    if(className === '.lose-message'){
      $('.lose').text('Your are loser.')
    }else if(className === '.draw-message'){
      $('.draw').text('It was a Draw.');
    }else{
      if(whoWin){
        $('.win').text(whoWin);
      }else{
        $('.win').text('You are winner.');
      }
    }
    $timeout(function() {
      $(className).fadeIn(500);
      hideMessage(className);
    }, 500);
  }

  function hideMessage(className) {
    $(className).fadeOut(3500);
  }

  function addClassName(indexx, indexx2, indexx3){
    $('#index-'+indexx).text().effect("shake");
    $('#index-'+indexx2).text().effect("shake");
    $('#index-'+indexx3).text().effect("shake");
    $('#index-'+indexx).addClass("result-bg");
    $('#index-'+indexx2).addClass("result-bg");
    $('#index-'+indexx3).addClass("result-bg");
  }

  function showPlayerTurnPrompt(turn) {
    console.log('let start ', turn);
    $('.player-turn p').text(turn);
    if(turn == 'Your turn' || turn == 'Player 1 turn'){
      $('.player-turn').effect( "shake" );
      $('.player-turn p').css('color', 'green');
    }else if(turn == 'Game Over'){
      $('.player-turn p').css('color', 'red');  
    }else{
      $('.player-turn p').css('color', 'yellow');
    }
  }

  function hidePlayerTurnPrompt() {
    $('.player-turn').animate(500);
  }

  function styleMovedCell(indx, type, turn){
    var indexx = document.getElementById("index-"+indx);
    if(type === 1){
      indexx.innerHTML = 'X';
      indexx.style.color = 'green';
      $('#index-'+indx).addClass( "occupied" );
    }else{
      indexx.style.color = 'yellow';
      $('#index-'+indx).html(turn).fadeIn(3000);
      $('#index-'+indx).addClass( "occupied" );
    }
  }

  function finalResult(Board, twoPlayer){
      var fB = Board;
      for(var i=0; i<=6; i = i+3) {
        if(fB[i] !== "E" && fB[i] === fB[i+1] && fB[i+1] === fB[i+2]){
          addClassName(i, i+1, i+2);
          if(twoPlayer){
            if(fB[i] === 'X'){
              showMessage('.win-message','Player 1 win');
            }else{
              showMessage('.win-message','Player 2 win');
            }
          }
          return true;
        }
      }
      
      for(var i=0; i<=2; i++) {
        if(fB[i] !== 'E' && fB[i] === fB[i+3] && fB[i+3] === fB[i+6]) {
          addClassName(i, i+3, i+6);
          if(twoPlayer){
            if(fB[i] === 'X'){
              showMessage('.win-message','Player 1 win');
            }else{
              showMessage('.win-message','Player 2 win');
            }
          }
          return true;
        }
      }
      
      for(var i=0,j=4; i<=2; i=i+2,j=j-2) {
        if(fB[i] !== 'E' && fB[i] === fB[i+j] && fB[i+j] === fB[i+2*j]){
          addClassName(i, i+j, i+j*2);
          if(twoPlayer){
            if(fB[i] === 'X'){
              showMessage('.win-message','Player 1 win');
            }else{
              showMessage('.win-message','Player 2 win');
            }
          }
          return true;
        }
      }

      function isEmptyCells() {
        var indxs = [];
        for(var j=0; j < 9; j++) {
          if(gameBoard[j] == 'E') {
            indxs.push(j);
          }
        }
        return indxs;
      }
      var available = isEmptyCells();
      if(available.length === 0) {
        showMessage('.draw-message')
        return true;
      }else {
        return false;
      }
  } 
   
  
} //end controller