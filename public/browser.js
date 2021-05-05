function itemTemplate(item) {
  return `
    <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
        <span class="item-text">${item.text}</span>
        <div>
          <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
          <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
        </div>
    </li>
  `
}

//Initial Page load render
let ourHTML = items.map(function(item){
  return itemTemplate(item)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)

// Async create feature
let createField = document.getElementById("create-field")
document.getElementById("create-form").addEventListener("submit", function(e) {
  e.preventDefault()
  
  if (createField.value) {  //don't handle it if blank
    axios.post('/create-item', {text: createField.value}).then(function(response){
        //
        //e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        //clear the input field
        createField.value=""
        createField.focus()
    }).catch(function() {
        console.log("please try again -- catch block")
    })  //axios.post return a 'promise' (no TIL request)
  }
})


document.addEventListener("click", function(e) {
  //Update Feature
  if (e.target.classList.contains("edit-me")) {
      let userInput = prompt("Enter the new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)  // saving the entry into var.
      let id = e.target.getAttribute("data-id")
      console.log("Assigning intput: " + userInput +" to ID: "+id)  //this is the browser's console, not Node/Code console.
      if (userInput) {
        axios.post('/update-item', {text: userInput, id: id}).then(function(){
            e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        }).catch(function() {
            console.log("please try again -- catch block")
        })  //axios.post return a 'promise' (no TIL request)
      }
  }

  //Delete Feature
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you really want to delete this item?")){
        axios.post('/delete-item', {id: e.target.getAttribute("data-id")}).then(function(){
            e.target.parentElement.parentElement.remove()
        }).catch(function() {
            console.log("please try again -- catch block")
        })  //axios.post return a 'promise' (no TIL request)
    }
  }
})