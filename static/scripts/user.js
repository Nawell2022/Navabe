

const Home = {
    template: '#home',
    name: 'Home',

    data: () => {
        return {
            books_data: [],
            researchWord: '',
            favorites: [],
            basket: [],
            modalWin: false,
            currentBook: '',
            user_is_connected: false,
            show_cart: false,
        }
    },

    computed: {
        result_filteringBooks() {
            return this.books_data.filter((book) => {
                return (
                    book.titre.toLowerCase().includes(this.researchWord.toLowerCase()) ||
                    book.auteur.toLowerCase().includes(this.researchWord.toLowerCase()) ||
                    book.isbn.toLowerCase().includes(this.researchWord.toLowerCase())
                );
            }).map((book) => {
                return {
                    ...book,
                    auteur: book.auteur.toLowerCase().includes(this.researchWord.toLowerCase()) ? book.auteur : '',
                    isbn: book.isbn.toLowerCase().includes(this.researchWord.toLowerCase()) ? book.isbn : ''
                };
            });
        },

        basketTotalAmount() {
            let total = 0;
            for (let book in this.basket) {
                total += (this.basket[book].prix * this.basket[book].quantite)
            }

            return total.toFixed(2);
        },

        basketTotalBooks() {
            let qty_books = 0;
            for (let book in this.basket) {
                qty_books += this.basket[book].quantite;
            }

            return qty_books;
        },

        basketCopy() {
            return this.basket.map(obj => ({ ...obj }));

        }
    },

    created: function () {
        this.getdata();
        this.getBasket();
    },

    methods: {

        getdata: function () {
            fetch('/getdata')
                .then(response => response.json())
                .then(data => {
                    this.books_data = data;
                });
        },

        setCurrentBook(book) {
            this.currentBook = ({
                isbn: book.isbn,
                titre: book.titre,
                auteur: book.auteur,
                editeur: book.editeur,
                categorie: book.categorie,
                synopsis: book.synopsis,
                parution: book.parution,
                prix: book.prix,
                img_url: book.url,
            })
            this.modalWin = !this.modalWin;
        },

        getBasket() {
            let basket = localStorage.getItem('navabe-user-cart');
            basket == null ? this.basket = [] :
                (basket.length > 0 ? this.basket = JSON.parse(basket) :
                    this.basket = []);
        },

        addToBasket(book) {
            this.show_cart = true;
            for (let i = 0; i < this.basket.length; i++) {
                if (this.basket[i].isbn === book.isbn) {
                    return this.basket[i].quantite++
                }
            }
            this.basket.push({
                isbn: book.isbn,
                titre: book.titre,
                auteur: book.auteur,
                prix: book.prix,
                quantite: 1,
                url: book.url,
            });
        },

        setCurrentisbn(isbn) {
            this.currentIsbn = isbn;
            this.modalWin = !this.modalWin;
        },
        addOne(book) {
            book.quantite += 1;
        },
        removeOne(book, id) {
            if (book.quantite == 1) {
                this.remove(id);
            } else {
                book.quantite -= 1;
            }
        },
        remove(id) {
            this.basket.splice(id, 1);
        },

        checkStock: function(id='', qty = 0){

            // Avant d'ajouter dans le panier on check la disponibilité

            bookID = new URLSearchParams();
            bookID.append('isbn', id)
            bookID.append('qty', qty)

            fetch('/check_stock',{
                method: 'POST',
                body : bookID
            })
            .then(response => response.json())
            .then (confirmation => {
                return confirmation;
            })
        }
    },

    watch: {
        basketCopy: function () {
            localStorage.setItem('navabe-user-cart', JSON.stringify(this.basketCopy));
        }
    }
}


const UserSettings = {
    template: '#usersettings',
    name: 'UserSettings',

    data() {
        return {
            user_infos: [],
            change_needed: false,
            new_pwd: "",
            msg_error: "This field must be filled with a minimum of 6 characters",
        }
    },

    methods: {
        get_user_session: function () {
            let user_cookie = $cookies.get('crt-user-infos');
            user_cookie == null ? this.user_infos = [] : this.user_infos = JSON.parse(atob(user_cookie));
            user_cookie == null ? this.is_connected = false : this.is_connected = !this.is_connected;
        },

        user_logout(id) {
            const data = new URLSearchParams();
            data.append('id', id)
            fetch('/logout', {
                method: "POST",
                body: data
            })
                .then(response => {
                    if (response.ok) {
                        alert('Successfully disconnected');
                        setTimeout(function () { alert.close(); }, 800);
                        window.location.href = "/main";
                    }

                })
                .catch(error => console.error(error))

        },

        need_change() {
            this.change_needed = !this.change_needed;

        },

        change_password(id) {

            const data = new URLSearchParams();

            data.append('id', id)
            data.append('password', this.new_pwd)

            fetch('/change_password', {

                method: "POST",
                body: data
            })
                .then(response => {
                    if (response.ok) {
                        alert('Password successfully changed.\nYou will be logged out shortly.');
                        setTimeout(function () { alert.close(); }, 800);
                        window.location.href = "/main";
                    }
                })
                .catch(error => console.error(error))
        },
    },
    created: function () {
        this.get_user_session();
    }
}


const WishList = {
    template: '#wishList',
    name: 'WishList',

    data: () => {
        return {
            favorites_books: [],
            recommended_books: [],
        }
    },

    methods: {
        get_favorites_books: function () {
            let f_books = [];
            let cookie_ = [];

            cookie_ = $cookies.get('nvb-bookstore-favorites');
            cookie_ == null ? f_books = [] : f_books = cookie_;

            this.favorites_books = f_books;
        },
    },

    mounted: function () {
        this.get_favorites_books();
    }
}



const ShoppingCart = {
    template: '#shoppingcart',
    name: '',

    data: () => {
        return {
            basket: [],
            is_connected: false,
        }
    },

    computed: {
        Total() {
            let sum = 0;

            for (let i = 0; i < this.basket.length; i++) {
                sum += this.basket[i].quantite * this.basket[i].prix;
            }

            return sum.toFixed(2);
        }
    },

    methods: {

        get_user_session: function () {
            let user_cookie = $cookies.get('crt-user-infos');
            user_cookie == null ? this.user_infos = [] : this.user_infos = JSON.parse(atob(user_cookie));
            user_cookie == null ? this.is_connected = false : this.is_connected = !this.is_connected;
        },


        getCart: () => {

            let user_cart = localStorage.getItem('navabe-user-cart');
            user_cart == null ? this.basket = [] : user_cart = JSON.parse(user_cart)

            if (user_cart.length > 0) {

                return user_cart;
            }

            return []
        },

        createPaypalButton: function(total = 0.10) {
            paypal.Buttons({
                disableFunding: 'card',
                createOrder: (data, actions) => {
                    return actions.order.create(
                        {
                            purchase_units: [
                                {
                                    amount: {
                                        value: total,
                                    }
                                }
                            ]
                        }
                    );
                },

                onApprove: (data, actions) => {

                    return actions.order.capture().then(details => {
                        //Si le paiement passe, alors la commande du client est passée
                        //Et on vide son panier
                        
                        this.makeOrder(details)

                    });
                }
            }).render('#paypal-button-container')

        },

        makeOrder: function(transaction_details) {
            //On collecte les données de la commade, puis on le traite et 
            //on les expedies au serveur
            
            //Récuperation du panier et l'ID du client

            let contents = {'isbn' : [], 'quantity' : []};
            let transactionID = transaction_details.id;
            let userID = JSON.parse(atob($cookies.get('crt-user-infos')))[0].ID
            let contents1 = []

            for(let i = 0; i < this.basket.length; i++)
            {
                contents.isbn.push(this.basket[i].isbn);
                contents.quantity.push(this.basket[i].quantite);
                contents1.push( this.basket[i].titre + " by " +
                                this.basket[i].auteur +"        x " +
                                this.basket[i].quantite.toString() +
                                "   " + this.basket[i].prix.toString())
            }

            const orderInfos = new URLSearchParams();  
            orderInfos.append('user_id', userID);
            orderInfos.append('transaction_id', transactionID);
            orderInfos.append('contents', JSON.stringify([contents]));
            orderInfos.append('contentsBooksInfos', JSON.stringify(contents1))
            orderInfos.append('total', this.Total);

            fetch('/make_order',
            {
                method: 'POST',
                body : orderInfos
            })
            .then(response => response.json())
            .then(confirmation =>{
                if(confirmation){

                    localStorage.removeItem('navabe-user-cart');
                    window.location.replace('/main')
                }
            })
            
        },

    },

    mounted: function () {

        this.get_user_session();

        //Si l'utilisateur n'est pas connecté alors on le renvoie où il pourra se connecter
        //Sinon il peut passer à l'achat
        if (this.is_connected) {
            this.basket = this.getCart();
            
            if (this.basket.length > 0) {
                window.addEventListener('load', () => {
                    this.createPaypalButton(this.Total);
                })

            }
        } else {
            window.location.replace('main#/user-settings')
        }

    },

}


const CashRegister = {}

const routes = [
    { path: '/', component: Home },
    { path: '/user-settings', component: UserSettings },
    { path: '/wish-list', component: WishList },
    { path: '/shopping-cart', component: ShoppingCart },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

const app = Vue.createApp({})
app.config.compilerOptions.delimiters = ['${', '}']

app.use(router)
app.mount('#app')