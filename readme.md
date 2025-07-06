# BTLZ WB Test

Автоматизированная система для получения тарифов Wildberries и экспорта данных в Google Sheets.

## Описание

Приложение автоматически:
- Получает тарифы коробок из API Wildberries каждый час
- Сохраняет данные в PostgreSQL базу данных
- Экспортирует данные в Google Sheets с форматированием

## Технологии

- **Node.js** с TypeScript
- **PostgreSQL** - база данных
- **Knex.js** - ORM и миграции
- **Google Sheets API** - экспорт данных
- **node-cron** - планировщик задач
- **Axios** - HTTP клиент
- **Zod** - валидация переменных окружения

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd btlz-wb-test
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `example.env`:
```bash
cp example.env .env
```

4. Настройте переменные окружения в `.env`:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=btlz-wb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

APP_PORT=5000

WB_API_TOKEN=your_wb_api_token
GOOGLE_SHEETS_KEY_FILE=google-credentials.json
```

5. Поместите файл `google-credentials.json` с учетными данными Google Service Account в корень проекта.

## Настройка базы данных

Выполните миграции:
```bash
npm run knex:dev migrate latest
```

Запустите сиды (если необходимо):
```bash
npm run knex:dev seed run
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшен
```bash
npm run build
npm start
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка проекта |
| `npm start` | Запуск продакшен версии |
| `npm run knex:dev` | Управление миграциями и сидами |
| `npm run spreadsheet:dev` | Управление Google Sheets таблицами (разработка) |
| `npm run spreadsheet` | Управление Google Sheets таблицами (продакшен) |
| `npm run tsc:check` | Проверка TypeScript |
| `npm run prettier` | Проверка форматирования кода |
| `npm run eslint` | Проверка линтером |

## Управление миграциями

```bash
# Применить все миграции
npm run knex:dev migrate latest

# Откатить последнюю миграцию
npm run knex:dev migrate rollback

# Создать новую миграцию
npm run knex:dev migrate make migration_name

# Создать новый сид
npm run knex:dev seed make seed_name
```

## Управление Google Sheets

```bash
# Добавить ID таблицы Google Sheets в базу данных (разработка)
npm run spreadsheet:dev add SPREADSHEET_ID

# Добавить ID таблицы Google Sheets в базу данных (продакшен)
npm run spreadsheet add SPREADSHEET_ID
```

Где `SPREADSHEET_ID` - это ID таблицы Google Sheets из URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Пример:
```bash
npm run spreadsheet:dev add 1AbC_dEfGhIjKlMnOpQrStUvWxYz1234567890
```

### Получение тарифов
Приложение автоматически получает тарифы коробок из API Wildberries каждый час:
- Название склада (`warehouse_name`)
- Коэффициент тарифа (`box_delivery_and_storage_expr`) - коэффициент в %, на который умножается стоимость доставки и хранения
- Доставка 1 литра (`box_delivery_dase`) - базовая стоимость доставки, ₽
- Доставка каждого дополнительного литра (`box_delivery_diter`) - стоимость доставки за каждый дополнительный литр, ₽
- Хранение 1 литра (`box_storage_base`) - базовая стоимость хранения, ₽
- Хранение каждого дополнительного литра (`box_storage_liter`) - стоимость хранения за каждый дополнительный литр, ₽
- Дата и время запроса

### Экспорт в Google Sheets
Данные экспортируются в Google Sheets с:
- Автоматическим созданием листа `stocks_coefs`
- Форматированием заголовков (жирный шрифт)
- Форматированием дат
- Автоматической настройкой ширины столбцов

### Планировщик
Приложение использует cron для автоматического выполнения задач:
- `0 * * * *` - каждый час получает тарифы и экспортирует данные

## Настройка Google Sheets

1. Создайте проект в Google Cloud Console
2. Включите Google Sheets API
3. Создайте Service Account
4. Скачайте JSON файл с ключами как `google-credentials.json`
5. Добавьте ID таблиц в таблицу `spreadsheets` в базе данных

## Переменные окружения

| Переменная               | Описание                           | Обязательная |
|--------------------------|------------------------------------|--------------|
| `POSTGRES_HOST`          | Хост PostgreSQL                    | Да           |
| `POSTGRES_PORT`          | Порт PostgreSQL                    | Да           |
| `POSTGRES_DB`            | Название базы данных               | Да           |
| `POSTGRES_USER`          | Пользователь БД                    | Да           |
| `POSTGRES_PASSWORD`      | Пароль БД                          | Да           |
| `APP_PORT`               | Порт приложения                    | Нет          |
| `WB_API_TOKEN`           | Токен API Wildberries              | Да           |
| `GOOGLE_SHEETS_KEY_FILE` | Путь к файлу с Google ключами      | Да           |
| `NODE_ENV`               | Окружение (development/production) | Нет          |

## Docker

Для запуска в Docker используйте:
```bash
docker-compose up -d
```
