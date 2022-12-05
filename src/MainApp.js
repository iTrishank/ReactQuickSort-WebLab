import React from 'react';
import Inputs from './sections/inputs.jsx';
import ArrayActualState from './sections/arrayActualState.jsx';
import MainPartition from "./sections/mainPartition.jsx";
import CallsQuickSort from "./sections/callsQuickSort.jsx";
import Controls from "./sections/controls.jsx";
import AnimationExplication from "./sections/animationExplication.jsx";


class MainApp extends React.Component{
  constructor(props){
    super(props);
    this.state={
      array:[],
      script:[]
    };

    this.getArrayFromControls=this.getArrayFromControls.bind(this);
    this.generateQuickSortScript=this.generateQuickSortScript.bind(this);
    this.swap=this.swap.bind(this);
    this.partition=this.partition.bind(this);
    this.quickSort=this.quickSort.bind(this);
  }

  getArrayFromControls(value){
      this.setState({array:value})
  }

  generateQuickSortScript(){
    if(this.state.script.length===0){
      var array=this.state.array.slice();
      this.quickSort(array,0,array.length-1);
      this.state.script.push(
        {
          oper:"Fquicksort",
          arrayState:array.slice(),
          start:this.state.script[this.state.script.length-1].start,
          end:this.state.script[this.state.script.length-1].end
        }
      )
    }
  } 

  swap(input, index_A, index_B) {
    let temp = input[index_A];

    input[index_A] = input[index_B];
    input[index_B] = temp;
  }

  partition(array,low,high){
    var pivot = array[high];  
    this.state.script.push(
    )
    var i = (low - 1)  
    var j;
    var contI=0;
    var contJ=0;
    for (j = low; j <= high-1; j++){
        contJ++;
        this.state.script.push(
          {
            oper:"Pmovej",
            start:low,
            end:high,
            i:contI,
            j:contJ,
            arrayState:array.slice(),
          }
        )
        if (array[j] < pivot){
            contI++;
            this.state.script.push(
              {
                oper:"Pmovei",
                start:low,
                end:high,
                pivot:pivot,
                i:contI,
                j:contJ,
                arrayState:array.slice(),
              }
            )
            i++;  
            this.swap(array,i,j)
            this.state.script.push(
              {
                oper:"Pswap",
                start:low,
                end:high,
                i:contI,
                j:contJ,
                arrayState:array.slice(),
              }
            )
        }
    }
    this.swap(array,i + 1,high)
    this.state.script.push(
      {
        oper:"PPswap",
        start:low,
        end:high,
        i:contI,
        j:contJ,
        arrayState:array.slice(),
      }
    )
    return (i + 1)
  }

  quickSort(array,start,end){
    if(start<end){
      this.state.script.push(
        {
          oper:"quicksort",
          start:start,
          end:end,
          i:0,
          j:0,
          arrayState:array.slice(),
        }
      )
      var pi= this.partition(array,start,end);
      this.quickSort(array,start, pi-1);
      this.quickSort(array,pi+1,end);
    }
  }


  render(){
    var screen;

    if(this.state.array.length!==0){
      this.generateQuickSortScript()
      screen=<MainAnimation array={this.state.array} script={this.state.script}/>
    }else{
      screen=<InitialScreen/>
    }
      
    return (
      <div className="container">
        <div className="blueBar">
          <div className="inputs">
            <div className="title">
              QuickSort
            </div>
              <Inputs onChange={this.getArrayFromControls}/>
          </div>
          <Explication/>
        </div>
        <div className="mainScreen">
          {screen}
        </div>
      </div>
    );
  }
}

function InitialScreen(){
  return (
    <div className="initialScreen">
        <span>Press "Start" to start!</span>
    </div>
  )
}

class MainAnimation extends React.Component{
  constructor(props){
    super(props);
    this.state={
      array:this.props.array,
      script:this.props.script,
      listCalls:[{
        text:"QuickSort("+this.props.script[0].start+","+this.props.script[0].end+")",
        done:false,
      },
      ],
      Pstart:this.props.script[0].start,
      Pend:this.props.script[0].end,
      wasABack:false,
      actualStep:0,
      velocity:2,
      play:false
    }
    this.handleOperationControl=this.handleOperationControl.bind(this);
    this.manageOperation=this.manageOperation.bind(this);
    this.goFinal=this.goFinal.bind(this);
    this.goFirst=this.goFirst.bind(this);
    this.refreshNextListCalls=this.refreshNextListCalls.bind(this);
    this.refreshBackListCalls=this.refreshBackListCalls.bind(this);
    this.playAnimation=this.playAnimation.bind(this);
    this.stopAnimation=this.stopAnimation.bind(this);
    this.playing=this.playing.bind(this);
    this.changeVelocity=this.changeVelocity.bind(this);
    this.velocities=[0,2000,1000,750,500,250];
  }

  refreshNextListCalls(scriptStep){
    this.state.listCalls[this.state.listCalls.length-1].done=true;
    this.state.listCalls.push(
      {
        text:"QuickSort("+scriptStep.start+","+scriptStep.end+")",
        done:false,
      }
    )
    this.refs.callQS.refreshListCalls(this.state.listCalls)
  }

  refreshBackListCalls(scriptStep){
    this.state.listCalls.pop();
    this.state.listCalls[this.state.listCalls.length-1].done=false;
    this.refs.callQS.refreshListCalls(this.state.listCalls)
  }

  cleanToFirstCall(){
    var newarray=this.state.listCalls.slice(0,1);
    newarray[0].done=false;
    this.setState({
      listCalls:newarray
    })
    this.refs.callQS.refreshListCalls(newarray)
  }

  putAllCalls(){
    var allCalls=[];
    for(var step of this.state.script){
      if(step.oper==="quicksort"){
        allCalls.push({
          text:"QuickSort("+step.start+","+step.end+")",
          done:true,
        })
      }
    }
    allCalls[allCalls.length-1].done=true;
    this.setState({
      listCalls:allCalls
    })
    this.refs.callQS.refreshListCalls(allCalls)
  }

  manageOperation(scriptStep,step,type){
    switch(scriptStep.oper){
      case "quicksort":
        this.refs.animation.disableAnimation()
        this.refs.animation.refreshQuickSort(scriptStep.start,scriptStep.end,scriptStep.arrayState);
        if(type==="NEXT")
          this.refreshNextListCalls(scriptStep);
        this.refs.explication.refreshPasoActual(step,"Index QuickSort is performed ("+scriptStep.start+") a table of contents ("+scriptStep.end+").")
      break;
      case "Pmovej":
        this.refs.animation.enableAnimation()
        this.refs.animation.moveJ(scriptStep.j)
        if("BACK"){
          this.refs.animation.moveI(scriptStep.i)
          this.refs.animation.swapNormal(scriptStep.arrayState)
        }
        this.refs.explication.refreshPasoActual(step,"The ▼ index that runs through the array is moved one position (de "+(scriptStep.j-2)+" a "+(scriptStep.j-1)+") and the element is compared with the pivot.");
      break;
      case "Pmovei":
        this.refs.animation.enableAnimation()
        this.refs.animation.moveI(scriptStep.i)
        if("BACK"){
          this.refs.animation.moveJ(scriptStep.j)   
          this.refs.animation.swapNormal(scriptStep.arrayState)
        }
        this.refs.explication.refreshPasoActual(step,"The ▲ index of the smallest element is moved one position (de "+(scriptStep.i-2)+" a "+(scriptStep.i-1)+") because the element ( ▼ < pivote ).");
      break;
      case "Pswap":
        this.refs.animation.enableAnimation()
        this.refs.animation.swapNormal(scriptStep.arrayState)
        this.refs.arrayActual.update(scriptStep.arrayState)
        this.refs.arrayActual.update(scriptStep.arrayState)
        this.refs.explication.refreshPasoActual(step,"Smaller element ▲ is swapped with current element ▼ (posición "+(scriptStep.i-1)+" with position "+(scriptStep.j-1)+").");
      break;
      case "PPswap":
        if(type==="NEXT"){
          this.refs.animation.swapNormal(scriptStep.arrayState)
        }
        else{

          if(step===(this.state.script.length-2)){
            this.state.listCalls[this.state.listCalls.length-1].done=false;
            this.refs.callQS.refreshListCalls(this.state.listCalls)
          }else{
            this.refreshBackListCalls(scriptStep);
          }
          this.refs.animation.swapAndUpdate(scriptStep.start,scriptStep.end,scriptStep.arrayState,scriptStep.j,scriptStep.i,this.state.script[step-1].arrayState[scriptStep.end])
        }
        this.refs.arrayActual.update(scriptStep.arrayState)
        this.refs.explication.refreshPasoActual(step,"The pivot is exchanged with a position in front of the smaller element (position "+(scriptStep.j)+" with position "+(scriptStep.i)+").");
      break;
      case "Fquicksort":
          this.state.listCalls[this.state.listCalls.length-1].done=true;
          this.refs.callQS.refreshListCalls(this.state.listCalls)
          this.refs.explication.refreshPasoActual(step,"The total execution of QuickSort ends and the array is already sorted.")
      break;
      default:
      break;
    }
  }

  handleOperationControl(type){
    var nextStep;
    switch(type){
      case "NEXT":
        if(this.state.actualStep<this.state.script.length-1){
          nextStep=this.state.actualStep+1;
          this.setState({actualStep:nextStep});
          this.manageOperation(this.state.script[nextStep],nextStep,type);
        }
      break;
      case "BACK":
        if(this.state.actualStep!==0){
          nextStep=this.state.actualStep-1;
          this.setState({actualStep:nextStep});
          this.manageOperation(this.state.script[nextStep],nextStep,type);
        }
      break;
      case "FNEXT":
          nextStep=this.state.script.length-1;
          this.setState({actualStep:nextStep});
          this.goFinal();
          this.putAllCalls();
      break;
      case "FBACK":
          nextStep=0;
          this.setState({actualStep:nextStep});
          this.goFirst();
          this.cleanToFirstCall();
      break;
      default:
      break;
    }
  }

  goFinal(){
    const scriptStep=this.state.script[this.state.script.length-1];
    this.refs.animation.disableAnimation()
    this.refs.animation.swapAndUpdate(scriptStep.start,scriptStep.end,scriptStep.arrayState,scriptStep.j,scriptStep.i,this.state.script[this.state.script.length-2].arrayState[scriptStep.end])
    this.refs.arrayActual.update(scriptStep.arrayState)
    this.refs.explication.refreshPasoActual(this.state.script.length-1,scriptStep.oper)
    this.refs.explication.refreshPasoActual(this.state.script.length-1,"The total execution of QuickSort ends and the array is already sorted.");
  }

  goFirst(){
    const scriptStep=this.state.script[0];
    this.refs.animation.disableAnimation()
    this.refs.animation.refreshQuickSort(scriptStep.start,scriptStep.end,scriptStep.arrayState);
    this.refs.arrayActual.update(scriptStep.arrayState)
    this.refs.explication.refreshPasoActual(0,"Index QuickSort is performed ("+scriptStep.start+") a table of contents ("+scriptStep.end+").")
  }

  playing(){
    if(this.state.actualStep<this.state.script.length-1){
      this.handleOperationControl("NEXT");
    }else{
      this.stopAnimation();
      this.refs.controls.ended();
    }
  }

  playAnimation(){
    this.interval = setInterval(this.playing,this.velocities[this.state.velocity]);
    this.setState({
      play:true
    })
  }

  stopAnimation(){
    clearInterval( this.interval );
    this.setState({
      play:false
    })
  }

  changeVelocity(value){
    this.setState({
      velocity: value
    })
    if(this.state.play){
      clearInterval( this.interval );
      this.playAnimation();
    }
  }

  render(){

    return(
      <div className="mainScreen">
        <ArrayActualState ref="arrayActual" array={this.state.array}/>
        <div className="screenCenter">
          <MainPartition ref="animation" 
          array={this.state.array}
          start={this.state.Pstart}
          end={this.state.Pend}
          />
          <CallsQuickSort ref="callQS" listCalls={this.state.listCalls}/>
        </div>
        <div className="screenCenter">
          <Controls ref="controls" onControl={this.handleOperationControl} velocity={this.changeVelocity}  play={this.playAnimation} stop={this.stopAnimation}/>
          <AnimationExplication ref="explication" totalPasos={this.state.script.length}
           descripcion={"Index QuickSort is performed ("+this.state.Pstart+") a table of contents ("+this.state.Pend+")."}
           pasoActual={this.state.actualStep} />
        </div>
      </div>
    );
  }
}


function Explication(){
  return (
    <div className="explication">
        <h1>
        What is QuickSort?
        </h1>
        <p>
        It is a “divide and conquer” algorithm that solves the ordering problem.
        </p>
        <p>
        Its operation is primarily based on the selection of a pivot (which will be
        the element by which an array is to be divided) and the partition function that sorts
        the minor and major elements to the pivot. 
        </p>
        <p>
        Your best case and average case are from <b>O(nlogn).</b><br></br>
        The worst case is of <b>O(n<sup>2</sup>)</b>.
        </p>
    </div>
  );
}


export default MainApp;
