
const video = document.getElementById('video');

const screenSmall = window.matchMedia("(max-width:700px)");
let predictedAge = [];

// console.log(faceapi.nets)
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models'),
    faceapi.nets.ageGenderNet.loadFromUri('models')
]).then(start);

//function to start Camera
function start(){
    navigator.getUserMedia(
        {video:true,
        audio:false },
        stream => video.srcObject = stream,
        error => alert("Something went Wrong!!!")

    )
}
//fixing screen size if screen size is small for eg - like smartphone or tablets

function screenResize(isScreenSmall){
    if(isScreenSmall.matches){
        video.style.width = "320px";
    }
    else{
        video.style.width = "500px";
    }
}

screenResize(screenSmall);
//screenSmall.addListener(screenResize);



video.addEventListener("play",()=>{
    const canvas = faceapi.createCanvasFromMedia(video);
    let container = document.querySelector(".container");
    canvas.style.width="500px";
    canvas.style.height="500px";
    container.append(canvas);
    
    const displaySize = {width:video.width,height:video.height}; 
    faceapi.matchDimensions(canvas,displaySize);
    setInterval(async () => {

       const detections = await faceapi.detectAllFaces(video,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        
        //console.log(detections);
        
        //all the results saving in resized Detections like gender,age ,expression etc
        const resizedDetections = faceapi.resizeResults(detections,displaySize);
       // console.log(resizedDetections);
        canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
        faceapi.draw.drawDetections(canvas,resizedDetections);
         faceapi.draw.drawFaceLandmarks(canvas,resizedDetections);

       //for landmark 
    //    let landmark = document.getElementById("landmark");
       
    //    landmark.addEventListener("click",()=>{
    //        var flag =true;
       
    //        if(flag){
    //            faceapi.draw.drawFaceLandmarks(canvas,resizedDetections);
    //        }
    //        else{
       
    //        }
    //        flag=!flag;
       
    //    })
        
        if(resizedDetections && Object.keys(resizedDetections).length>0){

            const age  = Number.parseInt(resizedDetections[0].age);
            const gender  = resizedDetections[0].gender;
            //expression stores values something like that={'happy':0..233,'sad':0.1200};
            const expression = resizedDetections[0].expressions;
             
            console.log(expression);
           const max_prob = Math.max(...Object.values(expression));
            // console.log(max_prob);
            // //emotion contains particular expression names
             const emotion = Object.keys(expression).filter(
                item => expression[item] === max_prob
             );
            
            let displayAge = document.getElementById('Age');
            displayAge.innerHTML = `Predicted Age - ${age}`;
         
           let displayExpressions = document.getElementById('expression');
            displayExpressions.innerHTML = `Facial Expression - ${emotion[0]}`;

            let displayGender = document.getElementById('Gender');
            displayGender.innerHTML = `Gender - ${gender}`;

        }
  
    }, 10);
})







