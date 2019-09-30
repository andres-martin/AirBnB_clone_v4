// Listen for changes on each INPUT checkbox tag
const amenIds = {};
const fillPlace = function (data) {
  const template = Handlebars.compile($('#place-template').html());
  data.forEach(function (place) {
    $('SECTION.places').append(template({ place: place }));
  });
};

const postSearch = function (data = {}) {
  $.ajax({
    type: 'POST',
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: fillPlace
  });
};

$(function () {
  $('.popover li input[type=checkbox]').on('change', function () {
    if ($(this).is(':checked')) {
      amenIds[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete amenIds[$(this).attr('data-id')];
    }
    const values = Object.values(amenIds);
    if (values.length > 0) {
      $('.amenities h4').text(values.join(', '));
    } else {
      $('.amenities h4').html('&nbsp;');
    }
  });

  $.get('http://0.0.0.0:5001/api/v1/status/', function (data) {
    $('DIV#api_status').toggle(data.status === 'OK', 'available');
    postSearch();
  }).fail(function () {
    console.error('CONNECTION REFUSED');
    $('DIV#api_status').removeClass('available');
  });
  $('button').on('click', function () {
    $('SECTION.places > article').remove();
    postSearch({ amenities: Object.keys(amenIds) });
  });
});
