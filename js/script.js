let question_objects;
let question_index;
let current_score;
const buttons = $(".btn-wrapper > .btn");

const startGame = async ()=>{
    let fetchedQuestions = await fetchQuestions();
    question_objects = fetchedQuestions.sort(()=> Math.random() - .5)
    question_index = -1;
    current_score = 0;
    nextQuestion();
};

const fetchQuestions = async ()=>{
    const response = await fetch("json/questions.json");
    const data = await response.json();
    return data;
};

const gameEnd = ()=>{
    $(".score-text").text(current_score);
    $(".question-card").addClass('hide');
    $(".game-end-card").removeClass('hide');
}

const nextQuestion = ()=>{
    question_index++;
    if(question_index >= 20){
        gameEnd();
        return;
    }
    const current_question_object = question_objects[question_index];
    $(".question-card .card-header").html(`Question #${question_index+1}`);
    $(".question-card .card-title").html(current_question_object.question);
    buttons.each((index, button)=>{
        $(button).removeClass("btn-success");
        $(button).removeClass("btn-danger");
        $(button).addClass("btn-secondary");
        $(button).html(current_question_object.choices[index]);
        $(button).removeClass("correct");
        if (current_question_object.correct_index == index){
            $(button).addClass("correct");
        }
    })
};

$(document).ready(function(){
    $("#start-btn").on('click', ()=>{
        let name = $("#name-input").val();
        
        if(name == ""){
            $(".name-warning").remove();
            let nameWarning = $("<p class='name-warning'>Please enter your name first</p>");
            nameWarning.insertAfter("#name-input");
        }else{
            startGame();
            $(".welcome-card").addClass('hide');
            $(".question-card").removeClass('hide');
        }
    })
    $(".btn-wrapper > .btn").on('click', (event)=>{
        const clickedBtn = $(event.currentTarget);
        clickedBtn.removeClass('btn-secondary');

        //if the button clicked is not the correct button, it will be marked red
        //else (button clicked is correct), it will be marked green by the code after the if block
        if ( !clickedBtn.hasClass("correct") ){
            clickedBtn.addClass('btn-danger');
        }
        //correct button will be marked green
        $(".btn-wrapper > .btn.correct").addClass('btn-success');
        $(".btn-wrapper > .btn.correct").removeClass('btn-secondary');
        
        
        if ( clickedBtn.hasClass("correct") ){
            $(".btn-wrapper > .btn.correct").addClass('btn-success');
            
            current_score += 10;
        }else{
            clickedBtn.addClass('btn-danger');
        }


        setTimeout(() => {
            nextQuestion();
        }, 2000);
    })
});