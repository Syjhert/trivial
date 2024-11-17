let question_objects;   // list of question objects to be asked in this CURRENT RUN
let question_index;     // the current index in the question objects to be shown in the question-card
let latest_question_index   // latest question index to be traversed, tells us the question that is YET TO BE ANSWERED
let current_score;      // current score accumulated by the user
let startTime;          // saves the current time every time a new question is shown (used for bonus points)
const buttons = $(".btn-wrapper > .btn.pressable"); // the choice buttons for each questions
const questionCard = $('.question-card');           // the question_card div (used for slide transitions)

// fetches ALL the questionsi from questions.json
// async because fetch returns a promise
const fetchQuestions = async ()=>{
    const response = await fetch("json/questions.json");
    const data = await response.json();
    return data;
};

// initializes the game
// picks 20 questions based on the chosen category and difficulty
// async to wait for the fetched questions to finish
const startGame = async (category, difficulty)=>{
    let fetchedQuestions = await fetchQuestions();

    // randomly sorts the questions at the start
    fetchedQuestions = fetchedQuestions.sort(()=> Math.random() - .5)

    // if category is chosen (not Any), removes all questions not in the chosen category
    if(category != 'Any'){
        fetchedQuestions = fetchedQuestions.filter(question => {
            return question.category === category
        });
    }

    // if difficulty is chosen (not Any), removes all questions not in the chosen difficulty
    if(difficulty != 'Any'){
        fetchedQuestions = fetchedQuestions.filter(question => {
            return question.difficulty === difficulty
        }); 
    }

    // gets the first 20 questions for the final array (in case there are more than 20 questions filtered)
    question_objects = fetchedQuestions.slice(0, 20);

    question_index = -1;    // sets to -1 first, because it will be added (becomes 0) when the first question is called
    latest_question_index = 0;  // the latest UNANSWER question is the first one, increments when player clicks a choice button
    current_score = 0;      // resets the user's score to zero
    nextQuestion();         // shows the coming question to the screen
};


const handlePrevNextButtons = ()=>{
    // hide both buttons at default
    $('.prev-btn').addClass('hide');
    $('.next-btn').addClass('hide');

    // if there are question BEFORE the current one, show the prev-btn
    if (question_index > 0){
        $('.prev-btn').removeClass('hide');
    }

    // if there are question AFTER the current one 
    // and the current one is not the LATEST UNANSWERED question,
    // show the next-btn
    if (question_index < latest_question_index){
        $('.next-btn').removeClass('hide');
    }
}

// changes the content of the question-card and shows it to the screen
const showQuestion = ()=>{
    handlePrevNextButtons();
    const current_question_object = question_objects[question_index];   // current question (with choices, answer, etc.)
    $(".question-card .card-header").html(`Question #${question_index+1}`); // change the question number
    $(".question-card .card-title").html(current_question_object.question); // change the QUESTION text

    let jumbled_choices = current_question_object.choices.slice(); // makes a copy of the question choices
    // if the current question is UNANSWERED YET, jumble the arrangement of the choices
    // else make they stay as is
    if (question_index === latest_question_index){
        jumbled_choices.sort(()=> Math.random() - .5);  // jumbles them (randomly sorted) for dynamic experience
    }
    buttons.each((index, button)=>{     // iterates each button in the question-card
        // remove all possible additional classes that each button can have
        $(button).removeClass("btn-success");
        $(button).removeClass("btn-danger");
        $(button).removeClass("correct");

        $(button).addClass("btn-secondary"); // sets the button color to default = gray
        const choice_text = jumbled_choices[index]; // the choice buttons text

        // the current choice's original index before the choices were jumbled
        const original_ind = current_question_object.choices.indexOf(choice_text);

        $(button).text(choice_text);    // sets the button's text 

        // if the current choice is the ORIGINAL CORRECT CHOICE before the choices were jumbled, add 'correct' class
        if (current_question_object.correct_index == original_ind){
            $(button).addClass("correct");
        }

        //if current question is unanswered yet, add 'pressable' class
        if(question_index === latest_question_index){
            $(button).addClass("pressable");
        }
    });
    
    // if the current question was ANSWERED ALREADY
    // NOTE: looking at previous questions does not display the jumbled choices and just shows
    // the original arrangement of the choices
    if(question_index != latest_question_index){
        $('.correct').removeClass("btn-secondary"); // remove gray color from the correct answer
        const answeredBtn = buttons[current_question_object.answer] // gets the html of the button that the user answered
        //compare the raw html of answeredBtn and '.correct' selection (using [0]) to see if they are the same
        // if they are not the same, then remove gray bg-color of the ANSWER BUTTON and change it to red
        if ( answeredBtn != $('.correct')[0]){
            $(answeredBtn).removeClass("btn-secondary");
            $(answeredBtn).addClass("btn-danger");
        }
        $('.correct').addClass("btn-success"); //change the bg-color of the CORRECT BUTTON to green
    }
}

const prevQuestion = ()=>{
    // add hide-left so that the question card slides to the left when disappearing
    questionCard.addClass('hide-left').removeClass('visible')
        .removeClass('hide-right'); // this is for when game is over but player goes to previous

    //decrement question_index but sets it to zero if decrement becomes negative
    question_index = Math.max(0, question_index-1);
    
    //remove buttons' pressable interactivity (class listener)
    buttons.each((index, button)=>{
        $(button).removeClass('pressable');
    });

    // add delay before PUTTING the card to the right (while invisible)
    setTimeout(() => {
        // change question content while invisible
        showQuestion();

        // Remove 'hide-left' class, and adding transfer-right to PUT the card on the right
        questionCard.removeClass('hide-left').addClass('transfer-right');
        

        // another delay before making the card APPEAR
        setTimeout(() => {
            // makes the card appear
            questionCard.removeClass('transfer-right').addClass('visible');
        }, 250);
    }, 250);

}

const nextQuestion = ()=>{
    // shows the dash below the question-card (the stand-in for the added score labels)
    $(".dash").removeClass('hide');
    // hides added score labels
    $(".base-score-added").addClass('hide');
    $(".bonus-score-added").addClass('hide');

    // add hide-right so that the question card slides to the right when disappearing
    questionCard.addClass('hide-right').removeClass('visible');

    // increments the question_index, if the index reaches 20, the game is over
    question_index++;
    if(question_index >= 20){
        gameEnd();
        return;
    }

    // add delay before removing hide-right (so that the timing with prevQuestion is the same)
    setTimeout(() => {
        // change question content while invisible
        showQuestion();

        // Remove 'hide-right' class, making the card slide in from the left
        questionCard.removeClass('hide-right');

        // another delay before making the card APPEAR
        setTimeout(() => {
            questionCard.addClass('visible');

            // saves the current time now that the question is show (finished timeout)
            startTime = Date.now();
        }, 250);
    }, 250);
};

const gameEnd = ()=>{
    $(".score-text").text(current_score); // updates the score-text in the game-end-card
    $(".question-container").addClass('hide');  // hides the question-card
    $(".game-end-card").removeClass('hide');    // shows the game-end-card
}

// waits for the document to finish loading before assigning listeners
$(document).ready(function(){

    // the "TRIVIAL!" title in the nav bar
    $(".home-link").on('click', ()=>{
        // hides other cards that are not related to the quiz
        $(".about-card").addClass('hide');
        $(".contact-card").addClass('hide');

        // if the question_index is not yet given a value (not started the quiz)
        // show the welcome-card
        // else show the CURRENT question-card
        if(question_index === undefined){
            $(".welcome-card").removeClass('hide');
        }
        else{
            $(".question-container").removeClass('hide');
        }
    })

    // the "About" link in the nav bar
    $(".about-link").on('click', ()=>{
        // hides other cards that are not the about-card
        $(".welcome-card").addClass('hide');
        $(".contact-card").addClass('hide');
        // hide question container
        $(".question-container").addClass('hide');
        // shows the about card
        $(".about-card").removeClass('hide');
    })

    // the "Contact" link in the nav bar
    $(".contact-link").on('click', ()=>{
        // hides other cards that are not the contact-card
        $(".welcome-card").addClass('hide');
        $(".about-card").addClass('hide');
        // hide question container
        $(".question-container").addClass('hide');

        // shows the contact card
        $(".contact-card").removeClass('hide');
    })

    // the start-btn in the welcome-card
    $("#start-btn").on('click', ()=>{
        // saves the category and difficulty chosen by the user
        let category = $("#category").val();
        let difficulty = $("#difficulty").val();

        // starts the game based on the user's chosen category and difficuly
        startGame(category, difficulty);
        // hides the welcome card
        $(".welcome-card").addClass('hide');
        // shows the question container
        // includes the current score, question card, prev-btn, next-btn, and the added scores label
        $(".question-container").removeClass('hide');
    })

    // the choice buttons in the question-card
    $(".pressable").on('click', (event)=>{
        // the clickedBtn that called this event listener
        const clickedBtn = $(event.currentTarget);

        // if pressable class is removed, the button cannot function normally
        // i.e. change color and call the nextQuestion
        if (!clickedBtn.hasClass('pressable'))
            return;

        // remove buttons' pressable interactivity (class listener)
        buttons.each((index, button)=>{
            $(button).removeClass('pressable');
        });
        // removes the gray color of the button
        clickedBtn.removeClass('btn-secondary');

        //if the button clicked is not the correct button, it will be marked red
        //else (button clicked is correct), it will be marked green by the code after the if block
        if ( !clickedBtn.hasClass("correct") ){
            clickedBtn.addClass('btn-danger');
        }
        //correct button will be marked green
        $(".btn-wrapper > .btn.correct").addClass('btn-success');
        // remove gray color in case clickedBtn is not the correct one
        $(".btn-wrapper > .btn.correct").removeClass('btn-secondary'); 
        
        // if clickedBtn is correct, add score system
        if ( clickedBtn.hasClass("correct") ){
            // remove the stand-in dash for the added score labels
            $(".dash").addClass('hide');
            // show the default score label (+50 per question)
            $(".base-score-added").removeClass('hide');
            // increment current score
            current_score += 50;

            // stores current time, when the answer is clicked (for bonus points calculation)
            const endTime = Date.now();
            // calculate the time taken by the user to answer the question (in seconds)
            let timeTaken = Math.floor((endTime - startTime) / 1000);
            // calculate the bonus points based on timeTaken being subtracted from 5 seconds
            // meaning if user answered in below 5 seconds they gain bonus points
            // bonus points = 10 times how far away are you from 5 seconds
            let bonus_points = (Math.max(5 - timeTaken, 0) * 10);
            // if bonus points is above zero, show the bonus points gained, else don't show
            if(bonus_points > 0){
                $(".bonus-score-added").text("Bonus: +" + bonus_points);
                $(".bonus-score-added").removeClass('hide');
            }
            // add bonus points to the current score
            current_score += bonus_points;
        }
        
        // the current question object for shorter syntax in next line
        const current_question_object = question_objects[question_index];
        // records the user answer in the question object based on the ORIGINAL choice index
        console.log(current_question_object.choices.indexOf(clickedBtn.text()));
        current_question_object.answer = current_question_object.choices.indexOf(clickedBtn.text());

        // increments latest_question_index, meaning there is a new UNANSWERED QUESTION INDEX
        latest_question_index++;
        // update score
        $(".score-text").text(current_score);

        // wait for 1.5 seconds delay so that the user can see how correct their answer is
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    })

    // prev-btn on the left of the question card
    $(".question-card > .prev-btn").on('click', ()=>{
        prevQuestion();
    })
    // next-btn on the right of the question card
    $(".next-btn").on('click', ()=>{
        nextQuestion();
    })
    // prev-btn on the left of the game-end-card in case the user wants to review all questions
    // after they finish the game
    $('.game-end-card > .prev-btn').on('click', ()=>{
        $(".game-end-card").addClass('hide'); // hide game-end card
        $(".question-container").removeClass('hide'); // show question-container
        prevQuestion();
    })
});