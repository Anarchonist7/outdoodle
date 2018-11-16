// $(() => {
//   $.ajax({
//     method: "GET",
//     url: "/api/users"
//   }).done((users) => {
//     for(user of users) {
//       $("<div>").text(user.name).appendTo($("body"));
//     }
//   });
// });

$(document).ready(function () {
  $('.startbtn').on('click', function() {
    $('.start').slideUp();
    $('.createEvent').slideDown();
  });

  $('.btn').on('click', function(event) {
    event.preventDefault();
    const $form = $('.createEvent');
    $.ajax({
      type: 'POST',
      url: '/events',
      data: $form.serialize(),
      success: function () {
        $form.slideUp();
        $('.details').slideDown();
      }
    });
  });

  $('.fas').on('click', function () {
    $('.fas').css('color', 'white');
    $(this).css('color', 'red');
  });

  $('.dtbtn').on('click', function (event) {
    event.preventDefault();
    const $form = $('.dtform');
    alert('wohoh there something must be done!');
    $.ajax({
      type: 'POST',
      url: '/events/:id',
      data: $form.serialize(),
      success: function () {
        alert('wohoh there something must be done!');
      }
    });

  });
});
