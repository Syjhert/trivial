nameInput = document.getElementById('name-input');
startBtn = document.getElementById('start-btn');

$(document).ready(function(){
    $("#start-btn").on('click', ()=>{
        let name = $("#name-input").val();
        
        if(name == ""){
            $(".name-warning").remove();
            let nameWarning = $("<p class='name-warning'>Please enter your name first</p>");
            nameWarning.insertAfter("#name-input");
        }else{
            $(".welcome-card").addClass('hide');
            $(".question-card").removeClass('hide');
        }
    })
    $(".btn-wrapper > .btn").on('click', ()=>{
        let buttons = $(".btn-wrapper > .btn");
        buttons.each((index, button)=>{
            $(button).removeClass('btn-secondary');
            if($(button).hasClass('correct')){
                $(button).addClass('btn-success');
            }else{
                $(button).addClass('btn-danger');
            }
        })
    })
});