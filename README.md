# Loans Frontend - Interfaz de Usuario

Frontend del sistema de gestión de préstamos, construido con **React** y **TypeScript**. Se integra con los microservicios del backend mediante una arquitectura de microservicios.

## Descripción

Este repositorio contiene la interfaz de usuario del sistema [loans-software](https://github.com/JuanPar063/loans-software). Permite a los usuarios solicitar préstamos, consultar su estado, ver su historial y gestionar su perfil. Los administradores pueden supervisar y aprobar solicitudes desde un panel dedicado.

## Tecnologías Utilizadas

- **React** – Biblioteca de UI
- - **TypeScript** – Tipado estático
  - - **Create React App** – Scaffolding del proyecto
    - - **CSS / Styled Components** – Estilos
     
      - ## Funcionalidades
     
      - - Registro e inicio de sesión de usuarios
        - - Solicitud de nuevos préstamos
          - - Consulta del estado de préstamos activos
            - - Historial de préstamos del usuario
              - - Panel de administración para supervisión de solicitudes
                - - Gestión de perfil de usuario
                 
                  - ## Requisitos Previos
                 
                  - - Node.js >= 16
                    - - npm
                     
                      - ## Instalación
                     
                      - ```bash
                        npm install
                        ```

                        ## Ejecución

                        ```bash
                        # Desarrollo
                        npm start
                        # La aplicación abre en http://localhost:3000

                        # Construcción para producción
                        npm run build
                        ```

                        ## Tests

                        ```bash
                        npm test
                        ```

                        ## Variables de Entorno

                        ```env
                        REACT_APP_API_URL=http://localhost:3000
                        REACT_APP_USER_SERVICE_URL=http://localhost:3001
                        REACT_APP_LOAN_SERVICE_URL=http://localhost:3002
                        ```

                        ## Parte del Ecosistema

                        - [loans-software](https://github.com/JuanPar063/loans-software) – Orquestador principal
                        - - [user-service](https://github.com/JuanPar063/user-service) – Servicio de usuarios
                          - - [loan-service](https://github.com/JuanPar063/loan-service) – Servicio de préstamos
                            - - [admin-service](https://github.com/JuanPar063/admin-service) – Servicio de administración
                             
                              - ## Autor
                             
                              - Juan Sebastian Pardo Anzola – [@JuanPar063](https://github.com/JuanPar063)
