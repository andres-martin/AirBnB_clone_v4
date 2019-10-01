// Listen for changes on each INPUT checkbox tag
const amenIds = {};
const statesIds = {};
const citiesIds = {};
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

const reviewsSearch = function () {
  const that = this;
  if ($(this).hasClass('active')) {
    $(this).removeClass('active');
    $(this).next().remove();
    $(this).text('Show');
  } else {
    $(this).addClass('active');
    $(this).text('Hide');
    $.ajax({
      type: 'GET',
      url: `http://0.0.0.0:5001/api/v1/places/${$(this).attr('id')}/reviews`,
      contentType: 'application/json',
      success: function (data) {
        const reviewContainerTemplate = Handlebars.compile($('#review-container-template').html());
        const template = Handlebars.compile($('#review-template').html());
        $(that).after(reviewContainerTemplate({ reviews: data }));
        for (const review of data) {
          let user;
          $.ajax({
            url: `http://0.0.0.0:5001/api/v1/users/${review.user_id}`,
            success: function (result) {
              user = result;
            },
            async: false
          });
          $(that).next().append(template({ review: review, user: user }));
        }
      }
    });
  }
};
const renderLocations = function () {
  const values = Object.values(citiesIds);
  const locations = values.concat(Object.values(statesIds));
  if (locations.length > 0) {
    $('.locations h4').text(locations.join(', '));
  } else {
    $('.locations h4').html('&nbsp;');
  }
};

$(function () {
  $('.amenities .popover li input[type=checkbox]').on('change', function () {
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

  $('.popover h2 input[type=checkbox]').on('change', function () {
    if ($(this).is(':checked')) {
      statesIds[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete statesIds[$(this).attr('data-id')];
    }
    renderLocations();
  });

  $('.locations .popover li input[type=checkbox]').on('change', function () {
    if ($(this).is(':checked')) {
      citiesIds[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      delete citiesIds[$(this).attr('data-id')];
    }
    renderLocations();
  });

  $('button').on('click', function () {
    $('SECTION.places > article').remove();
    postSearch({ amenities: Object.keys(amenIds), states: Object.keys(statesIds), cities: Object.keys(citiesIds) });
  });

  $('section.places').on('click', 'span.show-review', reviewsSearch);
});
