angular.module('booklist.feed', [])

.controller('FeedController', ['$scope', 'Books', 'Event', function($scope, Books, Event){
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
  
  $scope.eventBookInfo = function(bookInfo) {
    Event.eventBookInfo(bookInfo);
  };

  $scope.getBooks();
}])
.factory('Event', function() {

  var eventBookInfo = function(bookInfo) {
    console.log(bookInfo);
  };

  return {
    eventBookInfo: eventBookInfo
  };
});
