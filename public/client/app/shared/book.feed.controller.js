angular.module('booklist.feed', [])


.controller('FeedController', ['$scope', '$window', 'Books', 'Event', function($scope, $window, Books, Event){

  $scope.data = {};
  $scope.bookTemplate = 'app/shared/book.entry.html';
  $scope.getBooks = function(){
    Books.getBooks()
    .then(function(resp){
      $scope.data.books = resp;
      $scope.data.books.forEach(function (book) {
        // Adds reactionSlider variable to books with a user reaction to position thumb on slider properly
        if (book.reaction) {
          // Scaled at 0-100 to assure thumb position is not affected by load order
          book.reactionSlider = (book.reaction - 1) * 25;
        }
      });
    })
    .catch(function(error){
      console.log(error);
      return;
    });
  };

  $scope.addToReadList = function (bookTitle, bookISBN, publisher, highResImage, largeImage, mediumImage, smallResImage, thumbNail, amzURL, authorName, book) {
    Books.postBook({
      title: bookTitle,
      ISBN: bookISBN,
      publisher: publisher,
      high_res_image: highResImage,
      large_image: largeImage,
      medium_image: mediumImage,
      small_image: smallResImage,
      thumbnail_image: thumbNail,
      amz_url: amzURL
    }, authorName, 0);

    // User reaction of 0 indicates user has not read book, and book should be in to-read list
    book.reaction = 0;

    // Adds pop up message 'Added to...' when book addToReadList called
    Materialize.toast('Added to your reading list!', 1750);
  };
  
  $scope.hideModal = function() {
    $('.modal').modal('hide');
  };


  $scope.eventBookInfo = function(book) {
    Event.setEventBook(book);
    $($('.bookModal')[0]).modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $window.location.href = '/#/create';
  };



  

  $scope.clearBookInfo = function () {
    $scope.bookTitle = '';
    $scope.authorName = '';
    $scope.reaction = undefined;
    $scope.clearAmazonInfo();
    $('.reactions').find('.selected').removeClass('selected');
  };





  $scope.footerAddBook = function(book) {
    console.log('scope data', book);
    Books.postBook({
      title: book.title,
      ISBN: book.ISBN,
      publisher: book.publisher,
      high_res_image: book.high_res_image,
      large_image: book.large_image,
      medium_image: book.medium_image,
      small_image: book.small_image,
      thumbnail_image: book.thumbnail_image,
      amz_url: book.amz_url
    }, book.author.name, 5)
    .then(function(resp){
      console.log('book feed resp', resp);
      
      if (resp.book && resp.author) {
        var book = resp.book;
        book.author = {};
        book.ISBN = $scope.ISBN;
        book.author.name = resp.author.name;
        book.reaction = $scope.reaction;
        book.reactionSlider = (book.reaction - 1) * 25;
        book.high_res_image = $scope.high_res_image;
        book.large_image = $scope.large_image;
        book.medium_image = $scope.medium_image;
        book.small_image = $scope.small_image;
        book.thumbnail_image = $scope.thumbnail_image;
        book.amz_rul = $scope.amz_url;
        // $scope.clearBookInfo();
        // $scope.resetProfile();

        // $scope.resetProfile = function () {
        Books.getProfile();
  //   .then(function (resp) {
  //     if (resp.books) {
  //       $scope.books = resp.books;
  //       $scope.books.forEach(function (book) {
  //         book.reactionSlider = (book.reaction - 1) * 25;
  //       });
  //     }
  //   })
  //   .catch(function (error) {
  //     console.error(error);
  //   });
  // };  


        Materialize.toast('Book added!', 1750);
      }
    })
    .catch(function(error){
      console.error(error);
      return;
    });
  };  

  $scope.getBooks();
}]);
