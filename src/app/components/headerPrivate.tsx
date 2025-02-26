"use client";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "../api";



export default function HeaderPrivate() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${api}/notifications`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

 
  useEffect(() => {

    fetchNotifications(); 

    const interval = setInterval(fetchNotifications, 1000); 

    
    return () => clearInterval(interval);
  }, [session]);

  const toggleNotification = () => {
    setIsNotificationVisible(!isNotificationVisible);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`${api}/notifications/${notificationId}/mark-as-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao marcar notificação como lida');
      }

      
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      alert('Erro ao marcar notificação como lida');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`${api}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao apagar notificação');
      }

     
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Erro ao apagar notificação:', error);
      alert('Erro ao apagar notificação');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to logout. Please try again.");
    }
  };
  let unreadNotificationsCount

  if(session?.accessToken){
    unreadNotificationsCount = notifications.filter(notification => !notification.read).length;
  }

  return (
    <div>
      <header className="bg-black flex items-center justify-between p-4">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={150}
          height={50}
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
          style={{
            paddingLeft: "30px",
          }}
        />

        <div className="flex items-center rounded w-1/3">
          <input
            type="text"
            placeholder="Pesquisar ferramenta..."
            className="w-full px-4 py-2 rounded-l focus:outline-none outline-none"
          />
          <button className="bg-[#EF8D2A] text-white p-3 rounded-r hover:bg-[#cc7a24] transition-colors">
            <FaSearch />
          </button>
        </div>

        <div className="flex items-center space-x-4 mr-10 relative">
          <button
            onClick={toggleNotification}
            className="text-white font-bold bg-[#EF8D2A] p-3 rounded-full hover:bg-[#cc7a24] transition-colors relative"
          >
            <FaBell />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {isNotificationVisible && (
            <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg w-64 z-50">
              <div className="p-4">
                <h3 className="text-black font-semibold mb-2">Notificações</h3>
                <hr className="my-2" />
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="text-gray-700 py-2 flex justify-between items-center">
                      <div>
                        {notification.message}
                        {notification.read && <span className="text-sm text-gray-500"> (Lida)</span>}
                      </div>
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                          >
                            Marcar como lida
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-700 py-2">
                    Você não tem notificações
                  </div>
                )}
              </div>
            </div>
          )}

          {session?.user?.image && (
            <button
              onClick={togglePopup}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EF8D2A]"
            >
              <Image
                src={session.user.image}
                alt="Foto de perfil"
                width={40}
                height={40}
                className="object-cover"
              />
            </button>
          )}

          {isPopupVisible && (
            <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg w-48 z-50">
              <div className="p-4">
                <p className="text-black font-semibold">
                  {session?.user?.name}
                </p>
                <hr className="my-2" />
                <button
                  onClick={() => router.push("/minhas-ferramentas")}
                  className="block w-full flex items-center py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Image
                    src={"/assets/tools.svg"}
                    alt="tools icon"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  <span>Minhas Ferramentas</span>
                </button>

                <button
                  onClick={() => router.push("/minhas-reservas")}
                  className="block w-full flex items-center py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Image
                    src={"/assets/reservation.svg"}
                    alt="reservation icon"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  <span>Minhas Reservas</span>
                </button>

                <button
                  onClick={() => router.push("/chat")}
                  className="block w-full flex items-center py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Image
                    src={"/assets/chat.svg"}
                    alt="chat icon"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  <span>Chat</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full flex items-center py-2 text-red-500 hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}