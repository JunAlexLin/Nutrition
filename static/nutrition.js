$(document).ready(function(){
    // Handle form submission for search
    $("#formId").on("submit", function(event) {
        event.preventDefault();
        var searchTerm = $("input[name='search']").val();
        
        if(searchTerm.trim() !== '') {
            window.location.href = '/search?search=' + encodeURIComponent(searchTerm);
        } else {
            $("input[name='search']").val('').focus();
        }
    });

    window.searchItem = function(searchTerm) {
        window.location.href = '/search?search=' + encodeURIComponent(searchTerm);
    }; //JUST ADDED

    // Fetch and display popular items
    function fetchPopularItems() {
        $.ajax({
            url: '/popular_items',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                displayPopularItems(data);
            },
            error: function(error) {
                console.log('Error fetching popular items:', error);
            }
        });
    }

    function displayPopularItems(items) {
        var container = $('#food-list'); // Ensure targeting the correct container
        container.empty(); // Clear existing content
    
        // Shuffle the items array
        items = items.sort(function() { return 0.5 - Math.random(); });
    
        // Select the first 3 items from the shuffled array
        items.slice(0, 3).forEach(function(item) {
            // Create a Bootstrap row for each item
            var row = $('<div></div>').addClass('row');
            
            // Create a Bootstrap column for the image
            var imgCol = $('<div></div>').addClass('col-4');
            var img = $('<img />').attr('src', item.media_link).attr('alt', 'Image of ' + item.name).addClass('img-fluid home_images'); // 'img-fluid' for responsive images
            imgCol.append(img);
            
            // Create a column for the name which directs to the view_item page
            var nameCol = $('<div></div>').addClass('col-8'); 
            var link = $('<a></a>')
                .attr('href', '/view/' + item.id) // Adjust URL to direct to view_item page 
                .text(item.name)
                .addClass('item-link');
            nameCol.append(link);
            
            // Append columns to the row
            row.append(imgCol, nameCol);
            
            // Wrap the row in a list item
            var elem = $('<li></li>').addClass('food_list_item').append(row); // Wrap the link in a list item
    
            container.append(elem); // Append the list item to the container
        });
    }

    // Call the function to fetch and display popular items
    if ($('#food-list').length > 0) {
        fetchPopularItems();
    }


    $("#discard_btn").on("click", function(event) {
        event.preventDefault(); // Prevent the form from submitting
        var itemID = window.location.pathname.split('/').pop(); // Extract the item ID from the URL

        // Present a confirmation dialog box
        var userConfirmed = confirm("Are you sure you want to discard changes?");
        
        if(userConfirmed) {
            // If they are sure, redirect to the view/<id> page
            window.location.href = '/view/' + itemID;
        } else {
            // If they aren't sure, do nothing, allowing them to keep editing
        }
    });
    
    // Adding event listener for Add Item form submission with validation
    $("#addItemForm").on("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        let formData = $(this).serialize(); // Serialize the form data
        
        $.ajax({
            url: '/add',
            type: 'POST',
            data: formData,
            success: function(response) {
                // Create a link element
                var itemLink = $("<a>")
                    .attr("href", "/view/" + response.itemId) // Using the itemId from the response to construct the URL
                    .text("See it here!");
            
                // Append the link to the successMessage div
                $("#successMessage").html($("<div>").addClass("alert alert-success").text(response.message + " ").append(itemLink));
                
                // Optionally clear the form fields if needed
                $('#addItemForm')[0].reset();
                $('#addItemForm').find('input[type=text],textarea').first().focus();
            },
            error: function(xhr, status, error) {
                let errorMsg = "An error occurred";
                if(xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                $("#successMessage").html(`<div class="alert alert-danger" role="alert">${errorMsg}</div>`);

               
            }
            
        });
    });


    $("#editItemForm").on("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        var itemId = window.location.pathname.split('/').pop(); // Extract the item ID from the URL
        let formData = $(this).serialize(); // Serialize the form data

        $.ajax({
            url: '/edit/' + itemId, // Make sure to use the correct endpoint
            type: 'POST',
            data: formData,
            success: function(response) {
                // Assuming the response includes the itemId in a similar structure to the add response
                window.location.href = "/view/" + response.itemId; // Redirect to the view page of the item
            },
            error: function(xhr) {
                let errorMsg = "An error occurred";
                if(xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                $("#successMessage").html(`<div class="alert alert-danger" role="alert">${errorMsg}</div>`);
                // Scroll to the top of the page to show the error message
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            }
        });
    });
});
