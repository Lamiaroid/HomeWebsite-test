# HomeWebsite-test

_Тестовая версия, миллиард багов, корявый код, никакой оптимизации и т.д._

1. Нужен Node.js v16.20.2 (не выше)
2. Нужны Microsoft SQL Server Management Studio 18 и SQL Server 2022 Express
3. Указать своё название сервера в app/js/constants.js для константы server (название сервера будет что-то типа DESKTOP-RTK4EID\SQLEXPRESS (название компа\SQLEXPRESS))
    Потом:
    1) Зайти в Microsoft SQL Server Management Studio 18
    2) Указать название сервера и подключиться (название сервера будет что-то типа DESKTOP-RTK4EID\SQLEXPRESS (название компа\SQLEXPRESS))
    3) В "Обозревателе объектов" в "Базы данных" нажать ПКМ и выбрать "Присоединить"
    4) Выбрать mdf файл с базой данных и присоединить базу данных
    Если же базы данных нет, то нужно запустить скрипт для создания бд и таблиц в ней (бд должна называться LibraryDatabase)
4. Запустить через startServer.bat

![image](https://github.com/user-attachments/assets/386fc4a6-a3b0-467e-ae10-fbb2374ae9a1)

![image](https://github.com/user-attachments/assets/e647d23b-5487-4d56-a511-7501ad1433a8)
