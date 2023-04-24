class Product{
    //deal with a single product

    constructor(product){
        this.product=product
    }

    render(){
        //rendering a single product
        let html = `
        
        <div class="item">
        <img src=${this.product.productImg} alt="${this.product.productName}" >
        <div class="product-item__content">
          <h2>${this.product.productName}</h2>
          <h3>\$ ${this.product.productPrice}</h3>
          <p>${this.product.productDescription}</p>
          <button onclick="new Cart().addItem(${this.product.id})">Add to Cart</button>
          <button onclick="new Product().updateProduct(${this.product.id})">update</button>
         <button onclick="new Product().deleteProduct(${this.product.id})" ><ion-icon name="trash-outline"></ion-icon></button>
        </div>
     </div>
        
        `

        return html
    }
    async deleteProduct(id) {
        await fetch(`http://localhost:3000/products/${id}`, {
            method:'DELETE',
            headers:{
                "Content-Type": "application/json"
            }
        })
    }
    async updateProduct(id){
        const response = await fetch(`http://localhost:3000/products/${id}`)
        const product = await response.json()
      
       this.prePopulate(product)
       const btn = document.querySelector("#btn")
       btn.addEventListener('click', (e)=>{
        e.preventDefault()
        
        const updatedProduct= new Product().readValues();
        if(btn.innerText==="Update Product"){
            console.log("Updating");
            this.sendUpdate({...updatedProduct, id})
           }
       })

    }

    async sendUpdate(product){
        
        await fetch(`http://localhost:3000/products/${product.id}`, {
            method:'PUT',
            body:JSON.stringify(product),
            headers:{
                "Content-Type": "application/json"
            }
        })
    }
    prePopulate(product){
        document.querySelector("#p_name").value=product.productName
        document.querySelector("#p_image").value = product.productImg
        document.querySelector("#p_price").value =product.productPrice
        document.querySelector("#p_description").value=product.productDescription
        document.querySelector("#btn").textContent= `Update Product`
    }

    readValues(){
        const productName= document.querySelector("#p_name").value
        const productImg = document.querySelector("#p_image").value
        const productPrice =document.querySelector("#p_price").value
        const productDescription =document.querySelector("#p_description").value
        return {productName,productImg,productDescription, productPrice};
    }
    async addProduct(){
        const newProduct =new Product().readValues();
        await fetch(' http://localhost:3000/products', {
            method:'POST',
            body:JSON.stringify(newProduct),
            headers:{
                "Content-Type": "application/json"
            }
        })
    }
}

const btn = document.querySelector("#btn")

    btn.addEventListener('click', ()=>{
        if(btn.innerText==='Add Product'){
            new Product().addProduct()
        }
    })


class ProductList{
//deal with all products

     async render(){
        //get list of products and render- api call
        let products= await this.fetchProduct()
        // console.log(products);
        let html=''
        for(let product of products){
            const productHTML = new Product(product).render()
            html +=productHTML
        }
        return html
     }

     async fetchProduct(){
        const response = await fetch('http://localhost:3000/products')
        const products = await response.json()
        return products
     }
}

// Creates and returns an ion-icon node
const createIonIcon = (options) => {
    const ionicon = document.createElement("ion-icon");
    try {
        Object.keys(options.attributes).forEach(attribute => {
            ionicon.setAttribute(attribute, options.attributes[attribute]);
        });
        Object.keys(options.styles).forEach(mystyle => {
            ionicon.style[mystyle] = options.styles[mystyle];
        });
    } catch (error) {
        
    }
    return ionicon;
}

class Cart {
    constructor() {
        if (JSON.parse(localStorage.getItem('kishopChetu')) === null) {
            localStorage.setItem('kishopChetu', JSON.stringify({cartItems: []}))
        }
    }

    findItemIndex(items, itemId) {
        for (let index = 0; index < items.length; index++) {
            if (items[index].id == itemId) {
                return index
            }
        }
        return false
    }

    addItem(itemId) {
        let kishopChetu = this.getItems()

        let itemIndex = this.findItemIndex(kishopChetu.cartItems, itemId)
        if (typeof itemIndex === 'number') {
            kishopChetu.cartItems[itemIndex].quantity += 1
            return this.setItems(kishopChetu)
        }

        kishopChetu.cartItems.push({
            id: itemId,
            quantity: 1
        })
        return this.setItems(kishopChetu)
    }

    removeItem(itemId, trash=false) {
        let kishopChetu = this.getItems()
        let itemIndex = this.findItemIndex(kishopChetu.cartItems, itemId)
        trash = !trash && +kishopChetu.cartItems[itemIndex].quantity <= 1 ? true : trash
        if (typeof itemIndex === 'number') {
            if (trash) {
                kishopChetu.cartItems.splice(itemIndex, 1)
            } else {
                kishopChetu.cartItems[itemIndex].quantity -= 1
            }
            return this.setItems(kishopChetu)
        }

        return false
    }

    getItems() {
        return JSON.parse(localStorage.getItem('kishopChetu'))
    }

    setItems(items) {
        localStorage.setItem('kishopChetu', JSON.stringify(items))
        this.renderCart()
        return true
    }

    async getItemDetails(itemId) {
        let response = await fetch(`http://localhost:3000/products/${itemId}`)
        if (response.status == 200) {
            return await response.json()
        }
        return false
    }

    setItemIconsAttributes() {
        let minusIconElement = createIonIcon(
            {attributes: {
                name: "remove-circle-outline",
                alt: "minus item",
                class: "cart-item-icon minus-icon"}
            });

        let plusIconElement = createIonIcon(
            {attributes: {
                name: "add-circle-outline",
                alt: "plus item",
                class: "cart-item-icon plus-icon"}
            });

        let cartItemDeleteElement = createIonIcon(
            {attributes: {
                name: "trash-outline",
                alt: "remove item",
                class: "cart-item-icon delete-icon"}
            });
        
        [minusIconElement, plusIconElement, cartItemDeleteElement].map(element => {
            element.addEventListener('mouseover', ()=>{
                element.setAttribute('name', element.name.replace('-outline', ''))
            })
            element.addEventListener('mouseout', ()=>{
                if (element.name.indexOf('-outline') === -1) {
                    element.setAttribute('name', element.name + '-outline')
                  }
            })
        })
        
        return {minusIconElement, plusIconElement, cartItemDeleteElement}
    }

    styleItemElements(elements) {
        elements.cartItemImgElement.style.cssText = `width: 100%`
        elements.quantityContainerElement.style.cssText = `display: flex; justify-content: space-evenly; align-items: center; padding: 0.5rem 0`
        elements.cartItemValueElement.style.cssText = `display: flex; align-items: center`
    }

    createItemDivElements() {
        let cartItemElement = document.createElement('div')
        let cartItemNameElement = document.createElement('div')
        let cartItemPriceElement = document.createElement('div')
        let quantityContainerElement = document.createElement('div')
        let cartItemValueElement = document.createElement('div')
        let itemQuantityValueElement = document.createElement('div')

        return {cartItemElement, cartItemNameElement, cartItemPriceElement, quantityContainerElement, cartItemValueElement, itemQuantityValueElement}
    }

    setItemIconClickEvents(itemId, icons) {
        icons.minusIconElement.addEventListener('click', () => {
            this.removeItem(itemId)
        })
        icons.plusIconElement.addEventListener('click', () => {
            this.addItem(itemId)
        })
        icons.cartItemDeleteElement.addEventListener('click', () => {
            this.removeItem(itemId, true)
        })
    }

    renderItem(itemDetails) {
        let cartItemsElement = document.getElementById('cart-items')
        let divElements = this.createItemDivElements()
        divElements.cartItemElement.classList.add('cart-item')
        divElements.cartItemNameElement.innerHTML = itemDetails.productName
        let cartItemImgElement = document.createElement('img')
        cartItemImgElement.setAttribute('src', itemDetails.productImg)
        divElements.cartItemPriceElement.innerHTML = '$' + itemDetails.productPrice

        let iconElements = this.setItemIconsAttributes()

        divElements.itemQuantityValueElement.innerHTML = itemDetails.quantity

        this.styleItemElements({cartItemImgElement, quantityContainerElement: divElements.quantityContainerElement, cartItemValueElement: divElements.cartItemValueElement})

        this.setItemIconClickEvents(itemDetails.id, iconElements)

        divElements.cartItemValueElement.append(iconElements.minusIconElement, divElements.itemQuantityValueElement, iconElements.plusIconElement)
        divElements.quantityContainerElement.append(divElements.cartItemValueElement, iconElements.cartItemDeleteElement)
        divElements.cartItemElement.append(divElements.cartItemNameElement, cartItemImgElement, divElements.cartItemPriceElement, divElements.quantityContainerElement)

        cartItemsElement.appendChild(divElements.cartItemElement)
        return true
    }

    async renderCart() {
        document.getElementById('cart-count').innerHTML = this.getItems().cartItems.length
        document.getElementById('cart-items').innerHTML = ''
        let cartItems = this.getItems().cartItems

        let cartTotal = 0
        await cartItems.map(async cartItem => {
            let itemDetails = await this.getItemDetails(cartItem.id)
            itemDetails.id = +itemDetails.id
            itemDetails.quantity = cartItem.quantity
            cartTotal += +itemDetails.productPrice * +itemDetails.quantity
            document.getElementById('cart-total').innerHTML = '$' + cartTotal
            this.renderItem(itemDetails)
        })
        document.getElementById('cart-total').innerHTML = '$' + cartTotal
    }
}


class App{
    static async Init(){
        let productList=new ProductList()
        let htmlProducts = await productList.render()
        // console.log((htmlProducts));
        let app= document.querySelector('#app')
        app.innerHTML=htmlProducts
        await new Cart().renderCart()
    }    
}


App.Init()
// class CustomElement extends HTMLElement{
//     static async Init(){
//         let productList=new ProductList()
//         let htmlProducts = await productList.render()
//         // console.log((htmlProducts));
//         let app= document.querySelector('#app')
//         app.innerHTML=htmlProducts
//     }  
// }
// CustomElement.Init()
// CustomElement.define( "product-item" , CustomElement);

