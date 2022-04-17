$(() => {
    $("#topNavBurger").click(e => {
        $('#topNavList').toggleClass('top-nav__list_open')
        $('#overlay').toggleClass('overlay_open')

        return false
    })

    $("#overlay").click(e => {
        $('#overlay').removeClass('overlay_open')
        $('#topNavList').removeClass('top-nav__list_open')
    })

    $('.reviews-slider').slick({
        arrows: false,
        centerMode: true,
        dots: true,
        slidesToShow: 1,
        variableWidth: true,
        appendDots: '.reviews',
        dotsClass: 'reviews-slider__dots'
    })
})