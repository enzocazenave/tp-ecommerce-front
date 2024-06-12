import { useContext, useState, useEffect } from "react"
import api from "./api/api"
import { useForm, useModal } from "./hooks"
import { AuthContext } from "./context/AuthContext"
import toast from "react-hot-toast"

const initialLoginForm = {
  emailLogin: '',
  passwordLogin: '',
  name: '',
  lastName: '',
  address: '',
  dni: '',
  emailRegister: '',
  passwordRegister: '',
  role: 1,
  ivaCondition: "Responsable Inscripto"
}

const AuthComponent = () => {
  const { emailLogin, passwordLogin, name, lastName, address, dni, emailRegister, passwordRegister, role, ivaCondition, onInputChange } = useForm(initialLoginForm)
  const { login } = useContext(AuthContext)

  const handleLogin = async () => {
    if (emailLogin.length === 0 || passwordLogin.length === 0) {
      return
    }

    const { data: response } = await api.post('/auth/login', { email: emailLogin, password: passwordLogin })
    login(response.data)
  }

  const handleRegister = async () => {
    if (name.length === 0 || lastName.length === 0 || address.length === 0 || dni.length === 0 || emailRegister.length === 0 || passwordRegister.length === 0) {
      return
    }

    const { data: response } = await api.post('/auth/register', { name, lastName, address, dni: parseInt(dni), email: emailRegister, password: passwordRegister, role: parseInt(role), ivaCondition })
    login(response.data)
  }

  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-xl">Iniciar sesion</h2>
        <input className="border rounded-md p-2 w-fit" placeholder="Correo electronico" onChange={onInputChange} value={emailLogin} name="emailLogin" />
        <input className="border rounded-md p-2 w-fit" placeholder="Contraseña" onChange={onInputChange} value={passwordLogin} name="passwordLogin" />
        <button className="w-fit border py-2 px-6 rounded-md bg-blue-500 text-white" onClick={handleLogin}>Iniciar sesion</button>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <h2 className="font-semibold text-xl">Crear cuenta</h2>
        <input className="border rounded-md p-2 w-fit" placeholder="Nombre" onChange={onInputChange} value={name} name="name" />
        <input className="border rounded-md p-2 w-fit" placeholder="Apellido" onChange={onInputChange} value={lastName} name="lastName" />
        <input className="border rounded-md p-2 w-fit" placeholder="Dirección" onChange={onInputChange} value={address} name="address" />
        <input className="border rounded-md p-2 w-fit" type="number" placeholder="DNI" onChange={onInputChange} value={dni} name="dni" />
        <select className="border rounded-md p-2 w-full" onChange={onInputChange} value={role} name="role">
          <option value={2}>Rol Cliente</option>
          <option value={1}>Rol Administrador</option>
        </select>
        <select className="border rounded-md p-2 w-full" onChange={onInputChange} value={ivaCondition} name="ivaCondition">
          <option value="Responsable Inscripto">Responsable Inscripto</option>
          <option value="Monotributista">Monotributista</option>
          <option value="Consumidor Final">Consumidor Final</option>
        </select>
        <input className="border rounded-md p-2 w-fit" placeholder="Correo electronico" onChange={onInputChange} value={emailRegister} name="emailRegister" />
        <input className="border rounded-md p-2 w-fit" placeholder="Contraseña" onChange={onInputChange} value={passwordRegister} name="passwordRegister" />
        <button className="w-fit border py-2 px-6 rounded-md bg-blue-500 text-white" onClick={handleRegister}>Crear cuenta</button>
      </div>
    </div>
  )
}

const LogoutComponent = () => {
  const { logout, user } = useContext(AuthContext)

  return (
    <div className="flex justify-between items-center">
      <h2 className="font-semibold">{user.userId} | Permiso: {user.role}</h2>
      <button className="font-semibold w-fit border py-2 px-6 rounded-md bg-red-500 text-white" onClick={logout}>Cerrar sesion</button>
    </div>
  )
}

export const Modal = ({ isModalOpen, handleCloseModal, children }) => {
  if (!isModalOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  return (
    <div
      className="fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-4 rounded-md max-w-md w-full shadow-md relative">
        <button className="absolute top-3 right-3 cursor-pointer" onClick={handleCloseModal}>
          &times;
        </button>

        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

const Cart = ({ handleCloseModal, getOrders }) => {
  const [cart, setCart] = useState([])

  useEffect(() => {
    getCart()
  }, [])

  const getCart = () => {
    api.get('/cart').then(({ data: response }) => setCart(response.data))
  }

  const removeFromCart = (productId) => {
    api.delete('/cart/remove', {
      data: {
        productId,
        quantity: 1
      }
    }).finally(() => {
      setCart(prev => {
        const product = cart.find(cartProduct => cartProduct.productId === productId)

        if ((product.quantity - 1) === 0) {
          return prev.filter(cartProduct => cartProduct.productId !== productId)
        } else {
          return prev.map((products) => {
            if (products.productId === productId) {
              return { ...products, quantity: products.quantity - 1 }
            }

            return products
          })
        }
      })
    })
  }

  const confirmCart = () => {
    api.post('/orders/create').finally(() => {
      toast.success(`Confirmaste una orden de $${finalPrice}`)
      getOrders()
      handleCloseModal()
    })
  }

  const finalPrice = cart?.reduce((prev, curr) => prev + (curr.price * curr.quantity), 0.0).toFixed(2)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-xl">Carrito</h3>

      <div className="flex flex-col gap-2">
        {
          cart?.map(product => {
            return (
              <div key={product.productId} className="flex justify-between border py-2 px-4 items-center rounded-md">
                <div className="flex gap-4 items-center">
                  <img src={product.multimedia[0]} className="w-16 h-16 object-contain rounded-md" />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p>$ {product.price}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span>{product.quantity}x</span>
                  <button onClick={() => { removeFromCart(product.productId) }} className="text-red-500">Eliminar</button>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className="flex items-center justify-between w-full">
        {
          cart.length > 0
            ? (
              <>
                <p className="font-semibold text-lg">Total <br /><span className="font-normal">${finalPrice}</span></p>
                <button className="py-2 border rounded-md px-4 bg-blue-500 text-white text-sm font-semibold" onClick={confirmCart}>Confirmar carrito</button>
              </>
            )
            : <span>El carrito está vacío</span>
        }
      </div>
    </div>
  )
}

const initialPaymentForm = {
  method: ''
}

const Payment = ({ handleCloseModal, getOrders, getBills, selectedOrder }) => {
  const { method, onInputChange } = useForm(initialPaymentForm)

  const payOrder = () => {
    api.post(`/payments/pay/${selectedOrder.id}`, { paymentMethod: method }).finally(() => {
      getOrders()
      getBills()
      toast.success(`Pagaste el pedido ${selectedOrder.id} con el método de pago ${method}`, { duration: 7000 })
      handleCloseModal()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-xl">Pagar pedido {selectedOrder.id}</h3>
      <p className="font-semibold text-lg">Total <br /><span className="font-normal">${selectedOrder.price}</span></p>
      <div>
        <p>Método de pago</p>
        <select className="border rounded-md p-2 w-full mt-1" value={method} onChange={onInputChange} name="method">
          <option value="CUENTA_CORRIENTE">Cuenta Corriente</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
        </select>
      </div>
      <button
        onClick={payOrder}
        className="py-2 border rounded-md px-4 bg-blue-100 text-black text-sm font-semibold"
      >
        Pagar
      </button>
    </div>
  )
}

const initialProductCreateForm = {
  productName: '',
  productDescription: '',
  imageUrl: '',
  productPrice: ''
}

const CreateProduct = ({ handleCloseModal, getProducts }) => {
  const { productName, productDescription, imageUrl, productPrice, onInputChange, onResetForm } = useForm(initialProductCreateForm)

  const createProduct = () => {
    api.post('/products', {
      name: productName,
      description: productDescription,
      multimedia: [imageUrl],
      price: parseFloat(productPrice)
    })
    getProducts()
    onResetForm()
    handleCloseModal()
    toast.success('Producto creado con éxito')
  }

  return (
    <div className="flex flex-col gap-4">
      <h3>Crear producto</h3>

      <div className="flex flex-col gap-2 w-full">
        <input className="border rounded-md p-2 w-full" name="productName" value={productName} onChange={onInputChange} placeholder="Nombre del producto" />
        <textarea className="border rounded-md p-2 w-full" name="productDescription" value={productDescription} onChange={onInputChange} placeholder="Descripción"></textarea>
        <input className="border rounded-md p-2 w-full" name="imageUrl" value={imageUrl} onChange={onInputChange} placeholder="Imagen de producto" />
        <input type="number" className="border rounded-md p-2 w-full" name="productPrice" value={productPrice} onChange={onInputChange} placeholder="Precio" />
      </div>

      <button onClick={createProduct} className="py-2 border rounded-md px-4 bg-blue-500 text-white text-sm font-semibold w-full" >Crear producto</button>
    </div>
  )
}

const AuthenticatedComponent = ({ user }) => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [bills, setBills] = useState([])

  const [selectedOrder, setSelectedOrder] = useState({})

  const { isModalOpen: isCartModalOpen, handleOpenModal: handleCartModalOpen, handleCloseModal: handleCartCloseModal } = useModal({ defaultState: false })
  const { isModalOpen: isPaymentModalOpen, handleOpenModal: handlePaymentModalOpen, handleCloseModal: handlePaymentCloseModal } = useModal({ defaultState: false, callback: () => { setSelectedOrder({}) } })
  const { isModalOpen: isCreateProductModalOpen, handleOpenModal: handleCreateProductModalOpen, handleCloseModal: handleCreateProductCloseModal } = useModal({ defaultState: false })

  useEffect(() => {
    getProducts()
  }, [])

  useEffect(() => {
    getOrders()
  }, [])

  useEffect(() => {
    getBills()
  }, [])

  const getBills = () => {
    api.get('/bills/orders')
      .then(({ data: response }) => {
        setBills(response.data)
      })
  }

  const getOrders = () => {
    api.get('/orders')
      .then(({ data: response }) => {
        setOrders(response.data)
      })
  }

  const getProducts = () => {
    api.get('/products')
      .then(({ data: response }) => {
        setProducts(response.data)
      })
  }

  const addToCart = (id, name) => {
    api.put('/cart/add', { productId: id, quantity: 1 })
      .finally(() => {
        toast((c) => <span>Añadiste una unidad de <b>{name}</b> al carrito</span>, { duration: 5000, icon: '👌' })
      })
  }

  const deleteProduct = (id) => {
    api.delete(`/products/${id}`).finally(() => {
      getProducts()
      toast.success('Producto eliminado con éxito') 
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Modal isModalOpen={isCreateProductModalOpen} handleCloseModal={handleCreateProductCloseModal}>
        <CreateProduct handleCloseModal={handleCreateProductCloseModal} getProducts={getProducts} />
      </Modal>
      <Modal isModalOpen={isPaymentModalOpen} handleCloseModal={handlePaymentCloseModal}>
        <Payment getBills={getBills} selectedOrder={selectedOrder} handleCloseModal={handlePaymentCloseModal} getOrders={getOrders} />
      </Modal>
      <Modal isModalOpen={isCartModalOpen} handleCloseModal={handleCartCloseModal}>
        <Cart handleCloseModal={handleCartCloseModal} getOrders={getOrders} />
      </Modal>
      <LogoutComponent />
      <div className="flex flex-col gap-3">
        {bills?.length > 0 ? (<>
          <div className="flex justify-between">
            <h2 className="font-bold text-2xl">Facturas ({bills.length})</h2>
          </div>
          <div className="grid grid-cols-responsive gap-6">
            {bills?.map((bill) => (
              <div key={bill.id} className="border px-4 py-2 rounded-md flex flex-col gap-2">
                <div className="flex justify-between">
                  <div>
                    <p>Factura <b>{bill.id}</b></p>
                    <p><b>$ {bill.price}</b></p>
                  </div>
                  <div>
                    <span>{bill?.billedAt ? new Date(bill.billedAt).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false }) : ''}</span>
                    <p className="text-right"><b>{bill.products.reduce((prev, curr) => prev + curr.quantity, 0)}</b> productos</p>
                  </div>
                </div>
                <b>{bill.method}</b>
              </div>
            ))}
          </div>
        </>) : null}

        {orders.length > 0 ? (<>
          <div className="flex justify-between">
            <h2 className="font-bold text-2xl">Pedidos ({orders.length})</h2>
          </div>
          <div className="grid grid-cols-responsive gap-6">
            {orders?.map((order) => (
              <div key={order.id} className="border px-4 py-2 rounded-md flex flex-col gap-2">
                <div className="flex justify-between">
                  <div>
                    <p>Pedido <b>{order.id}</b></p>
                    <p><b>$ {order.price}</b></p>
                  </div>
                  <div>
                    <span>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: false }) : ''}</span>
                    <p className="text-right"><b>{order.products.reduce((prev, curr) => prev + curr.quantity, 0)}</b> productos</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handlePaymentModalOpen()
                    setSelectedOrder(order)
                  }}
                  className="py-2 border rounded-md px-4 bg-blue-100 text-black text-sm font-semibold"
                >Pagar pedido</button>
              </div>
            ))}
          </div>
        </>) : null}
        <div className="flex justify-between items-end">
          <h2 className="font-bold text-2xl">Productos</h2>
          <div className="flex gap-2">
            { user.role === 1 
              ? (<button onClick={handleCreateProductModalOpen} className="py-2 border rounded-md px-4 bg-blue-500 text-white text-sm font-semibold">Crear producto</button>) : null
            }
            <button onClick={handleCartModalOpen} className="py-2 border rounded-md px-4 bg-blue-500 text-white text-sm font-semibold">Ver carrito</button>
          </div>
        </div>
        <div className="grid grid-cols-responsive gap-6">
          {products?.map((product) => (
            <div key={product._id} className="flex flex-col gap-4 rounded-xl border p-8 ">
              { user.role === 1 
                ? ( <button onClick={() => { deleteProduct(product._id) }} className="py-2 border rounded-md px-4 bg-red-500 text-white text-sm font-semibold w-fit">Eliminar producto</button>) : null
              }
             
              <img src={product.multimedia[0]} />
              <p className="font-semibold line-clamp-1">{product.name}</p>
              <p className="line-clamp-3">{product.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-blue-500 font-semibold text-lg">$ {product.price}</p>
                <button onClick={() => { addToCart(product._id, product.name) }} className="py-2 border rounded-md px-4 bg-blue-500 text-white text-sm font-semibold">Añadir al carrito</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default () => {
  const { status, user } = useContext(AuthContext)

  return (
    <main className="p-6">
      {status === 'not_authenticated' ? <AuthComponent /> : null}
      {status === 'authenticated' ? <AuthenticatedComponent user={user} /> : null}
    </main>
  )
}
