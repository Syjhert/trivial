let question_objects;
let question_index;
let latest_question_index
let current_score;
let startTime;
const buttons = $(".btn-wrapper > .btn.pressable");
const questionCard = $('.question-card');

const fetchQuestions = async ()=>{
    const response = await fetch("json/questions.json");
    const data = await response.json();
    return data;
};

const startGame = async (category, difficulty)=>{
    let fetchedQuestions = await fetchQuestions();

    fetchedQuestions = fetchedQuestions.sort(()=> Math.random() - .5)

    if(category != 'Any'){
        fetchedQuestions = fetchedQuestions.filter(question => {
            return question.category === category
        });
    }

    if(difficulty != 'Any'){
        fetchedQuestions = fetchedQuestions.filter(question => {
            return question.difficulty === difficulty
        }); 
    }

    question_objects = fetchedQuestions.slice(0, 20);
    console.log(question_objects);

    question_index = -1;
    latest_question_index = 0;
    current_score = 0;
    nextQuestion();
};

const addToLeaderbord = ()=>{

}

const gameEnd = ()=>{
    $(".score-text").text(current_score);
    $(".question-container").addClass('hide');
    $(".game-end-card").removeClass('hide');
}

const handlePrevNextButtons = ()=>{
    //hide both buttons at default
    $('.prev-btn').addClass('hide');
    $('.next-btn').addClass('hide');

    if (question_index > 0){
        $('.prev-btn').removeClass('hide');
    }

    if (question_index < latest_question_index){
        $('.next-btn').removeClass('hide');
    }
}

const showQuestion = ()=>{
    handlePrevNextButtons();
    const current_question_object = question_objects[question_index];
    $(".question-card .card-header").html(`Question #${question_index+1}`);
    $(".question-card .card-title").html(current_question_object.question);

    let jumbled_choices = current_question_object.choices.slice();
    jumbled_choices.sort(()=> Math.random() - .5);
    buttons.each((index, button)=>{
        //remove all possible additional classes that each button can have
        $(button).removeClass("btn-success");
        $(button).removeClass("btn-danger");
        $(button).removeClass("correct");

        //sets the button color to default = gray
        $(button).addClass("btn-secondary");
        const choice_text = jumbled_choices[index];
        const original_ind = current_question_object.choices.indexOf(choice_text);
        $(button).text(choice_text);
        if (current_question_object.correct_index == original_ind){
            $(button).addClass("correct");
        }

        //if current question is unanswered yet
        if(question_index === latest_question_index){
            $(button).addClass("pressable");
        }
    });
    
    if(question_index != latest_question_index){
        $('.correct').removeClass("btn-secondary");
        const answeredBtn = buttons[current_question_object.answer]
        //compare the raw html of answeredBtn and '.correct' selection (using [0]) to see if they are the same
        if ( answeredBtn != $('.correct')[0]){
            $(answeredBtn).removeClass("btn-secondary");
            $(answeredBtn).addClass("btn-danger");
        }
        $('.correct').addClass("btn-success");
    }
}

const prevQuestion = ()=>{
    questionCard.addClass('hide-left').removeClass('visible');


    //decrement question_index but sets it to zero if decrement becomes negative
    question_index = Math.max(0, question_index-1);
    //remove buttons' interactivity
    buttons.each((index, button)=>{
        $(button).removeClass('pressable');
    });

    setTimeout(() => {

        showQuestion();

        // Remove 'hide-right' class, making the card slide in from the left
        questionCard.removeClass('hide-left').addClass('transfer-right');
        

        // Trigger the slide-in effect from the left
        setTimeout(() => {
            questionCard.removeClass('transfer-right').addClass('visible');
        }, 250); // Ensure the content update happens before slide-in
    }, 250);

}

const nextQuestion = ()=>{
    questionCard.addClass('hide-right').removeClass('visible');

    question_index++;
    if(question_index >= 20){
        gameEnd();
        return;
    }

    setTimeout(() => {
        showQuestion();

        // Remove 'hide-right' class, making the card slide in from the left
        questionCard.removeClass('hide-right');

        // Trigger the slide-in effect from the left
        setTimeout(() => {
            questionCard.addClass('visible');
        }, 250); // Ensure the content update happens before slide-in
    }, 250);
    startTime = Date.now();
};

$(document).ready(function(){
    $("#start-btn").on('click', ()=>{
        let category = $("#category").val();
        let difficulty = $("#difficulty").val();

        startGame(category, difficulty);
        $(".welcome-card").addClass('hide');
        $(".question-container").removeClass('hide');
    })
    $(".pressable").on('click', (event)=>{
        const clickedBtn = $(event.currentTarget);

        //if pressable class is removed, the button cannot function normally
        //i.e. change color and call the nextQuestion
        if (!clickedBtn.hasClass('pressable'))
            return;

        buttons.each((index, button)=>{
            $(button).removeClass('pressable');
        });
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

            current_score += 50;

            const endTime = Date.now();
            let timeTaken = Math.floor((endTime - startTime) / 1000);
            current_score += (Math.max(5 - timeTaken, 0) * 10);
        }else{
            clickedBtn.addClass('btn-danger');
        }
        
        const current_question_object = question_objects[question_index];
        current_question_object.answer = current_question_object.choices.indexOf(clickedBtn.text())

        latest_question_index++;
        $(".score-text").text(current_score);


        setTimeout(() => {
            nextQuestion();
        }, 1500);
    })

    $(".question-card > .prev-btn").on('click', ()=>{
        prevQuestion();
    })
    $(".next-btn").on('click', ()=>{
        nextQuestion();
    })
    $('.game-end-card > .prev-btn').on('click', ()=>{
        $(".game-end-card").addClass('hide');
        prevQuestion();
        $(".question-container").removeClass('hide');
    })
});