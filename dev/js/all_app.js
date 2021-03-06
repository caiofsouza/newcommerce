'use strict';


var API_HOST = 'http://localhost:3000/api/';
var app = angular.module('newCommerce', 
    ['ngRoute', 'ngCookies', 'ngSanitize', 'ngFileUpload']);

app.filter('formatDate', function(){
// receive date on yyyy-mm-dd hh:mm:ss format
// and return dd/mm/yyyy hh:mm:ss
return function(date){

    var year =  date.slice(0,4);
    var month = date.slice(5,7);
    var day = date.slice(8,10);
    var hours = date.slice(10);

    return day+'/'+month+'/'+year + " às "+ hours;

}

});

app.filter('realCurrency', function(){
// receive date on yyyy-mm-dd hh:mm:ss format
// and return dd/mm/yyyy hh:mm:ss
return function(value){

    var new_value = "R$ "+ (value.toFixed(2)).replace('.', ',');
    return new_value;   

}

});

app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {

            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });

        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});


app.config(['$locationProvider', '$routeProvider', '$httpProvider', 
    function($locationProvider, $routeProvider, $httpProvider){

        $routeProvider
        .when('/', {
            redirectTo: '/login'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl',
            title: "Login",
            needAuth: false
        })
        .when('/home', {
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl',
            title: "Home",
            needAuth: true
        })
        .when('/messages', {
            templateUrl: 'views/messages.html',
            controller: 'MessagesCtrl',
            title: "Mensagens",
            needAuth: true
        })
        .when('/products', {
            templateUrl: 'views/products.html',
            controller: 'ProductsCtrl',
            title: "Produtos",
            needAuth: true
        })
        .when('/products/new', {
            templateUrl: 'views/new_product.html',
            controller: 'ProductCtrl',
            title: "Novo Produto",
            needAuth: true
        })
        .when('/product/:product_id', {
            templateUrl: 'views/product.html',
            controller: 'ProductCtrl',
            title: "Produto",
            needAuth: true
        })
        .when('/categories', {
            templateUrl: 'views/categories.html',
            controller: 'CategoriesCtrl',
            title: "Categorias",
            needAuth: true
        })
        .when('/categories/new', {
            templateUrl: 'views/new_category.html',
            controller: 'CategoryCtrl',
            title: "Nova Categoria",
            needAuth: true
        })
        .when('/category/:category_id', {
            templateUrl: 'views/category.html',
            controller: 'CategoryCtrl',
            title: "Categoria",
            needAuth: true
        })
        .when('/banners', {
            templateUrl: 'views/banners.html',
            controller: 'BannersCtrl',
            title: "Banners",
            needAuth: true
        })
        .when('/banner/:banner_id', {
            templateUrl: 'views/banner.html',
            controller: 'BannerCtrl',
            title: "Banner",
            needAuth: true
        })
        .when('/users', {
            templateUrl: 'views/users.html',
            controller: 'UsersCtrl',
            title: "Usuários",
            needAuth: true
        })
        .when('/user/:user_id', {
            templateUrl: 'views/user.html',
            controller: 'UserCtrl',
            title: "Usuário",
            needAuth: true
        })
        .when('/orders/:order_id', {
            templateUrl: 'views/order.html',
            controller: 'OrderCtrl',
            title: "Pedido",
            needAuth: true
        })
        .when('/orders', {
            templateUrl: 'views/orders.html',
            controller: 'OrdersCtrl',
            title: "Pedidos",
            needAuth: true
        });


        $routeProvider.otherwise({ redirectTo: '/home' });
        $locationProvider.html5Mode(true);

    }
    
]);

// app.config(function($provide) {

//     $provide.decorator('$http', function($delegate, $q) {

//         var pendingRequests = {};
//         var $http = $delegate;

//         function hash(str) {
//             var h = 0;
//             var strlen = str.length;
//             if (strlen === 0) {
//                 return h;
//             }
//             for (var i = 0, n; i < strlen; ++i) {
//                 n = str.charCodeAt(i);
//                 h = ((h << 5) - h) + n;
//                 h = h & h;
//             }
//             return h >>> 0;
//         }

//         function getRequestIdentifier(config) {
//             var str = config.method + config.url;
//             if (config.data && typeof config.data === 'object') {
//                 str += angular.toJson(config.data);
//             }
//             return hash(str);
//         }

//         var $duplicateRequestsFilter = function(config) {

//             if (config.ignoreDuplicateRequest) {
//                 return $http(config);
//             }

//             var identifier = getRequestIdentifier(config);

//             if (pendingRequests[identifier]) {
//                 if (config.rejectDuplicateRequest) {
//                     return $q.reject({
//                         data: '',
//                         headers: {},
//                         status: config.rejectDuplicateStatusCode || 400,
//                         config: config
//                     });
//                 }
//                 return pendingRequests[identifier];
//             }

//             pendingRequests[identifier] = $http(config).finally(function() {
//                 delete pendingRequests[identifier];
//             });

//             return pendingRequests[identifier];
//         };

//         Object.keys($http).filter(function(key) {
//             return (typeof $http[key] === 'function');
//         }).forEach(function(key) {
//             $duplicateRequestsFilter[key] = $http[key];
//         });

//         return $duplicateRequestsFilter;
//     });
// });

app.run(['$rootScope','$location', '$route', 'Auth','$http', '$interval',
    function($rootScope, $location, $route, Auth, $http, $interval) {
        var auth = new Auth();
        // console.log(auth);

        // $interval(function(){
        //     auth.checkUser(function(cookie_obj){
        //         console.log(cookie_obj);
        //     });
        // }, 10000);

        auth.checkUser(function(cookie_obj){

            if(cookie_obj){
                $http.defaults.headers.common['x-access-token'] = cookie_obj.token;
            }
        });

        $rootScope.$on('$routeChangeStart', function(event, next, current) { 

            $rootScope.path = $location.path();

            auth.checkUser(function(cookie_obj){ 

                if(cookie_obj){
                    $http.defaults.headers.common['x-access-token'] = cookie_obj.token;
                } 

                var nextPath = $location.path();
                var nextRoute = $route.routes[nextPath];


                if(next.needAuth == true && cookie_obj == undefined){
                    // redirect to login if need auth 
                    $location.path("/login");

                }else if( ( nextPath == '/login' || nextPath == '/' ) && cookie_obj != undefined){
                    // redirect to home if have token
                    $location.path("/home");

                }
            });

        });

        $rootScope.$on("$routeChangeSuccess", function(event, current, previous){
            //Change page title, based on Route information
            $rootScope.title = $route.current.title;

        });

    }
]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files);
                });
            });
        }
    };
}]);

app.service('fileUploadProduct', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, product_id, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        fd.append('product_id', product_id);

        $http.post(uploadUrl, fd, {
            headers: {'Content-Type': undefined }
        })
        .success(function(result){
            alert("asdadsadsads");
            console.log("Uploaded image" + file);
        })
        .error(function(err){
            alert("123213132213");
            console.error("error: " + err);
        });
    }
}]);




app.controller('BannersCtrl', ['$cookies', '$location', '$http',
	function($cookies, $location, $http){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;
	self.progressPercentage = 0;

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');

	};


	
}]);
app.controller("CategoriesCtrl", ['$cookies', '$location', '$http',
	function($cookies, $location, $http){
	var self = this;

	// user var to load header infos
	self.user = JSON.parse($cookies.get('api_auth')).user;

	self.allCategories = [];
	self.onEdition = "";
	self.category = {
		name: "",
		sub_cats: []
	};
	self.messageAdd = "";


	self.getAllCategories = function(){
		self.inLoading = true;
		$http.get(API_HOST + 'categories').then(function(res){
			// return res.data;
			self.allCategories = res.data.sort(function(a, b){
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
				    return 1;
			    }
			  	if (a.name.toLowerCase() < b.name.toLowerCase()) {
			    	return -1;
			  	}
				// a must be equal to b
		  		return 0;
			});

			self.inLoading = false;
		});
	};

	self.getAllCategories();

	self.saveCategory = function(){
		self.messageAdd = "";

		if(self.category.name != ""){

			self.inLoading = true;

			$http.post(API_HOST + 'category', self.category).then(function(res){

				if(res.data.result){

					self.category = {
						name: "",
						sub_cats: []
					};

					self.allCategories.push(res.data.result);

					self.allCategories = self.allCategories.sort(function(a, b){
						if (a.name.toLowerCase() > b.name.toLowerCase()) {
						    return 1;
					    }
					  	if (a.name.toLowerCase() < b.name.toLowerCase()) {
					    	return -1;
					  	}
						// a must be equal to b
				  		return 0;
					});


					self.messageAdd = "Categoria adicionada com sucesso!";
					self.inLoading = false;
				}
			});

		}else{
			self.messageAdd = "Preencha o campo de nome!";
		}
	};

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};

	self.edit = function(cat_id){

		var hideAll = self.allCategories.filter(function(el){
			return el.visible === true;
		});

		if(hideAll.length > 0){
			hideAll[0].visible = false;
		}

		var selectedCategory = self.allCategories.filter(function(el){
			return el._id === cat_id;
		});



		if(hideAll.length > 0 && hideAll[0]._id == cat_id){
			// btn salvar clicked
			
			if(selectedCategory[0].name != ""){
				$http.put( API_HOST + 'category/' + cat_id, selectedCategory[0]).then(function(res){
					selectedCategory[0].btnStatus = "Editar";
					selectedCategory[0].visible = false;
				});
			}

		}else{
			// btn editar clicked
			selectedCategory[0].btnStatus = "Salvar";
			selectedCategory[0].visible = true;
		}
		
	};

}]);
// app.controller("HeaderCtrl", ['$cookies', '$location', '$http', 
// 	function($cookies, $location, $http){
// 	var self = this;

// 	self.user = JSON.parse($cookies.get('api_auth')).user;

// 	self.logout = function(){
// 		$cookies.remove('api_auth');
// 		$location.path('/login');
// 	};
// }]);
app.controller('HomeCtrl', ['$cookies', '$location',
	function($cookies, $location){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;



	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};
	
}]);
app.controller('LoginCtrl', ['$location', 'Auth', '$http',
	function($location, Auth, $http){
	var self = this;

	self.user_email = "";
	self.user_password = "";
	self.auth = new Auth();

	self.user_login = function(){
		self.messageError = "";
		
		if(self.user_email != "" && self.user_password != ""){
			self.email_error = self.pass_error = false;


			var user_obj = {
				email: self.user_email, 
				password: self.user_password 
			};


			self.auth.loginUser(user_obj, function(result){
				if(result == true){
				  	$location.path("/home").replace(); 
				}else{
					self.messageError = "Usuário ou senha incorretos!";
				}
			});	

		}else{
			if(self.user_email == ""){
				self.email_error = true;
				self.messageError = "Preencha o campo de email";
			}else{
				self.pass_error = true;
				self.messageError = "Preencha o campo de senha";
			}
		}

	};

}]);
app.controller('MessagesCtrl', ['$cookies', '$location',
	function($cookies, $location){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;



	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};
	
}]);
app.controller("OrdersCtrl", ['$scope', '$cookies', '$location', '$http', 
	function($scope, $cookies, $location, $http){
	var self = this;
	self.allOrders = [];
	self.count = 0;

	// user var to load header infos
	self.user = JSON.parse($cookies.get('api_auth')).user;

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};

	self.getAllOrders = function(){
		$http.get(API_HOST + 'orders').then(function(res){
			if(res.data){
				res.data[2].status = 0;
				var arr_orders = [];
				for (var i = 0; i < 15; i++) {
					res.data.forEach(function(el, ind){
						arr_orders.push(el);	
					});
				}

				self.allOrders = arr_orders;
				self.count = self.allOrders.length;
			}
		});
	};

	self.getAllOrders();


}]);






app.controller('ProductCtrl', 
	['$location','$routeParams', '$cookies', '$http', 'Upload', '$timeout', 'fileUploadProduct',
	function($location, $routeParams, $cookies, $http, Upload, $timeout, fileUploadProduct){
	var self = this; 
	
	// user var to load header infos
	self.user = JSON.parse($cookies.get('api_auth')).user;
	self.messageError = "";
	self.uploadProgressBar = "0%";

	self.product = {
		available_marketplace: false,
		active: false,
		tags: []
	};

	self.previewUploadImages = [];

	self.inLoading = false;

	self.allTags = [];
	self.selectedCategories = [];
	self.allCategories = [];

	self.getAllTags = function(){
		self.inLoading = true;
		$http.get(API_HOST + 'tags').then(function(res){
			// return res.data;
			self.allTags = res.data;
			self.inLoading = false;
		});
	};

	self.getAllTags();

	self.getAllCategories = function(){
		self.inLoading = true;
		$http.get(API_HOST + 'categories').then(function(res){
			// return res.data;
			self.allCategories = res.data;
			self.inLoading = false;
		});
	};

	self.getAllCategories();
	


	// need to study a way to use the same url to get by id and by url
	// self.getProductByUrl = function(productUrl){
	// 	$http.get(API_HOST + 'product/'+productUrl).then(function(res){
	// 		// return res.data;
	// 		self.product = res.data;
	// 		self.product.url = self.newUrl(self.product.name);
	// 	});
	// };

	self.getProductById = function(product_id){
		self.inLoading = true;
		$http.get(API_HOST + 'product/'+product_id).then(function(res){
			// return res.data;
			self.product = res.data;
			
			self.selectedCategories = self.product.categories;
			self.inLoading = false;
		});
	};


	if($routeParams.product_id){
		var i = 0;
		self.getProductById($routeParams.product_id);
	}


	self.save = function(){

		self.validForm(function(hasError){

			if(!hasError){
				self.inLoading = true;
				// if dont have any error
				$http.post(API_HOST + 'product/', self.product).then(function(res){
					if(res.data.result){
						self.uploadProductImg( res.data.result._id );

						self.messageError = "Produto adicionado com sucesso!";
						self.product = {
							available_marketplace: false,
							active: false,
							tags: []
						};

					}
					self.inLoading = false;
				});
			}
		});
		
	};

	self.update = function(){
		var uploadImgUrl = API_HOST + 'product-upload/';

		self.validForm(function(hasError){

			if(!hasError){
				// if dont have any error
				self.inLoading = true;

				$http.put(API_HOST + 'product/'+self.product._id, self.product ).then(function(res){

					var filesToUpload = self.product.files;

					if(filesToUpload){
						angular.forEach(filesToUpload, function(file){
							fileUploadProduct.uploadFileToUrl(file, self.product._id, uploadImgUrl);
							console.log("upload_img");
						});
					}

					if(res.data.message){
						self.messageError = "Produto alterado com sucesso!";
						self.product = res.data.result;
					}
					self.inLoading = false;

				});
			}
		});
		
	};

	self.validForm = function(fnCallback){
		var hasError = false;
		self.messageError  = "";
		self.product_name_error = 
		self.product_code_error = 
		self.product_price_error = 
		self.product_stock_error = 
		self.product_description_error = false;

		// check each input field
		if(self.product.name == "" || self.product.name == undefined){
			self.product_name_error = true;
			self.messageError = "Preencha o campo de nome";
			hasError = true;

		}else if(self.product.code == "" || self.product.code == undefined){
			self.product_code_error = true;
			self.messageError = "Preencha o campo de código";
			hasError = true;

		}else if(self.product.price == "" || self.product.price == undefined){
			self.product_price_error = true;
			self.messageError = "Preencha o campo de preço";
			hasError = true;

		}else if(self.product.stock == "" || self.product.stock == undefined){
			self.product_stock_error = true;
			self.messageError = "Preencha o campo de estoque";
			hasError = true;

		}else if(self.product.description == "" || self.product.description == undefined){
			self.product_description_error = true;
			self.messageError = "Preencha o campo de descrição";
			hasError = true;
		}

		if(fnCallback != undefined){
			fnCallback(hasError);
		}
	};

	self.newUrl = function(name){
		var new_url = name.toLowerCase();
		new_url = new_url.replace(/[^\w\s]/gi,"").replace(/\s/g, "-");
		return new_url;
	};

	self.updateUrl = function(value){
		self.product.url = self.newUrl(value);
	};

	self.validateUrl = function(){
		var notAllowSpecialChars = /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:|\_/g;
		self.product.url = self.product.url.replace(/\s/g, '-').replace(notAllowSpecialChars, '').toLowerCase();
	};

	self.tagsToLower = function(){
		if(self.product.tags.length <= 0 ){
			self.product.tags = [];
		}else{
			var tags = [];
			var notAllowSpecialChars = /\`|\~|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\+|\=|\[|\{|\]|\}|\||\\|\'|\<|\,|\.|\>|\?|\/|\""|\;|\:|\_|\s/g;
			self.product.tags.forEach(function(el, ind){
				tags.push(el.replace(notAllowSpecialChars, '').toLowerCase())
			});
			self.product.tags = tags;
		}
	};


	// self.uploadProductImg = function() {

 //  		if (self.product.files) {
 //  			var files = self.product.files;

 //  			angular.forEach(files, function(file){

 //  				file.upload = Upload.upload({
	// 	            url: API_HOST + 'product-upload/',
	// 	            data: { file_uploaded: file, 'product_id': self.product._id },
	// 	            headers: {
 //            			'x-access-token': $http.defaults.headers.common['x-access-token'];
 //            		}
	// 	        });

	// 	        file.upload.then(function (res) {

	// 	        	$timeout(function(){
	// 		            console.log('Success ' + res.config.data.file_uploaded.name + 'uploaded. Response: ' + res.data);
 //                    });

	// 	        }, function (res) {

	// 	            console.log('Error status: ' + res.status);

	// 	        }, function (evt) {
	// 	            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total)) + "%";

	// 	        });

 //  			});
 //      	}

 //    };

    self.checkFiles = function($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event){
    	self.product.files.forEach(function(el, idx){
    		el.progress = 0;
    		self.previewUploadImages.push(el);
    	});
    	// console.log(self.previewUploadImages);
	};

    self.removePreview = function(previewIndex){
    	self.previewUploadImages.splice(previewIndex, 1);
    	self.product.files.splice(previewIndex, 1);
    };

    self.removeImages = function(imageIndex){
    	self.product.images.splice(imageIndex, 1);
    };

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};

	
}]);
app.controller('ProductsCtrl', ['$cookies','$http', '$location', 
	function($cookies, $http, $location){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;
	self.reorder = 'cards'; // initial order of products grid

	self.reorderInCards = function(){
		console.log("reorder cards");
		self.reorder = 'cards';
	};

	self.reorderInTable = function(){
		console.log("reorder table");
		self.reorder = 'table';
	};

	self.searchProduct = function(){
		if(self.search_input != "" && self.search_input != undefined){
			$http.get(API_HOST + 'search-products/'+ self.search_input).then(function(res){
				self.products = res.data;
				self.count = self.products.length;
			});
		}else{
			self.getAllProducts();
		}
	}

	self.getAllProducts = function(){
		$http.get(API_HOST + 'products').then(function(res){
			// console.log(res);
			self.products = res.data;
			self.count = self.products.length;
		});
	};

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};

	self.uploadImage = function(){
		
	};

	self.count = 0;
	self.getAllProducts();

}]);
app.controller('UserCtrl', ['$cookies', '$location',
	function($cookies, $location){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};
	
}]);
app.controller('UsersCtrl', ['$cookies', '$location',
	function($cookies, $location){
	var self = this;

	self.user = JSON.parse($cookies.get('api_auth')).user;

	self.logout = function(){
		$cookies.remove('api_auth');
		$location.path('/login');
	};
	
}]);
app.factory('Auth', ['$http', '$location', '$cookies',
    function($http, $location, $cookies) {  

    function Auth(){
        this.token = '';


        this.loginUser = function(user_obj, fncallback) {
            var response;

            $http({
                method: 'POST',
                url: API_HOST+'login/',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data:{
                    email: user_obj.email,
                    password: user_obj.password
                }
            }).then(function successCallback(response) {
                // save token in session
                $cookies.put('api_auth', JSON.stringify(response.data));
                

                if(fncallback != undefined){
                    fncallback(true);
                }

            }, function errorCallback(response) {

                if(fncallback != undefined){
                    fncallback(false);
                }
            });

        };

        this.checkUser = function(fncallback){
            var token = $cookies.get('api_auth') != undefined ? 
                        JSON.parse($cookies.get('api_auth')) : undefined;

            if(fncallback != undefined){

                fncallback(token);
            }

        }
    };

    return Auth;
}]);
// jquery scripts for DOM
$(function() {
    $(document).on("click", ".dropdown", function(e) {
        e.preventDefault();
        $(this).find(".dropdown-submenu").slideToggle(200);
    });

});