// Listen for changes on each INPUT checkbox tag
const amenIds = {};

$(function () {
  $('.popover li input[type=checkbox]').on('change', function () {
    if ($(this).is(':checked')) {
      amenIds[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenIds[$(this).attr('data-id')];
    }
    const values = Object.values(amenIds);
    // $('.amenities h4').text(values.join());
    if (values.length > 0) {
      $('.amenities h4').text(values.join(', '));
    } else {
      $('.amenities h4').html('&nbsp;');
    }
    console.log(amenIds);
  });

  $.get('http://0.0.0.0:5001/api/v1/status/', function (data) {
    $('DIV#api_status').toggle(data.status === 'OK', 'available');
  }).fail(function () {
    console.error('CONNECTION REFUSED');
    $('DIV#api_status').removeClass('available');
  });
});
