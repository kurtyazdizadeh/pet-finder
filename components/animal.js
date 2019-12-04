class Animal {
  constructor(data, callbacks){
    this.handleClick = this.handleClick.bind(this);

    this.callbacks = callbacks,
    this.data = data,

    this.dom = {
      list: {
        row: null,
        divImage: null,
        image: null,
        name: null,
        breeds: null,
        size: null,
        age: null
      },
      details: {
       row: null,
       description: null
      }
    }
  }
  handleClick(e) {
    this.callbacks.click(this, e);
  }
  renderListItem(){
    var list = this.dom.list;
    var details = this.dom.details;

    var $row      = list.row       = $("<div>", { class: "row", "data-toggle": "collapse", "data-target": `.pet-${this.data.id} `});
    var $divImage = list.divImage  = $("<div>", { class: "col" });
    var $name     = list.name      = $("<div>", { class: "col", text: this.data.name });
    var $breeds   = list.breeds    = $("<div>", { class: "col", text: this.data.breeds.primary });
    var $size     = list.size      = $("<div>", { class: "col", text: this.data.size });
    var $age      = list.age       = $("<div>", { class: "col", text: this.data.age });

    if (this.data.photos.length > 0){
      var $image = list.image = $("<img>", { class: "img-thumbnail", src: `${this.data.photos[0].small}` });
      $divImage.append($image);
    }

    $($row).append($divImage, $name, $breeds, $size, $age);

    var $detailRow    = details.row          = $("<div>", { class: `row collapse pet-${this.data.id}` });
    var $description  = details.description  = $("<div>", { class: "card card-body", text: this.data.description });

    $detailRow.append($description);

    return $row;
  }
}
