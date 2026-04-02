# Инструкция по настройке генерации презентаций

## ✅ Что уже готово:

1. ✅ Фронтенд компонент `src/pages/Presentation.jsx`
2. ✅ Функция генерации промпта `src/utils/aiGeneration.js`
3. ✅ API для сохранения/загрузки `netlify/functions/presentation-api.js` и `server/routes/presentation.js`
4. ✅ База данных схема `database/presentation-tables.sql`
5. ✅ Шаблоны презентаций `src/data/presentationTemplates.js`
6. ✅ **API endpoint для генерации через OpenAI** `netlify/functions/generate-presentation.js` и `server/routes/ai.js`

---

## 🔧 Что нужно сделать для запуска:

### 1. Создать таблицу в базе данных:

Выполните SQL скрипт в вашем Neon dashboard:

```sql
-- Файл: database/presentation-tables.sql
CREATE TABLE IF NOT EXISTS presentations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic TEXT,
    template_id VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'kk',
    slide_count INTEGER NOT NULL,
    slides JSONB NOT NULL,
    presentation_type VARCHAR(50),
    ktp VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presentations_user ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_created ON presentations(created_at DESC);
```

### 2. Установить зависимости:

```bash
npm install openai
```

(Уже выполнено)

### 3. Настроить переменные окружения:

#### Для локальной разработки (`.env` в корне проекта):

```env
DATABASE_URL=your_neon_database_url
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini  # или gpt-4o для лучшего качества
```

#### Для Netlify (Environment Variables в Netlify Dashboard):

- `DATABASE_URL` - ваш Neon database URL
- `OPENAI_API_KEY` - ваш OpenAI API ключ
- `OPENAI_MODEL` (опционально) - модель по умолчанию `gpt-4o-mini`

---

## 🚀 Как это работает:

1. Пользователь заполняет форму в `Presentation.jsx`
2. Функция `generateSlideContent` в `src/utils/aiGeneration.js` создает промпт
3. Запрос идет на `/api/ai/generate-presentation` (локально) или `/.netlify/functions/generate-presentation` (production)
4. API endpoint вызывает OpenAI API и генерирует JSON массив слайдов
5. Слайды возвращаются на фронтенд
6. Презентация сохраняется в базу данных через `presentation-api`
7. Пользователь может просмотреть презентацию в превью

---

## 📝 Примеры использования:

### Локальная разработка:

1. Запустите сервер: `npm run server` (в отдельном терминале)
2. Запустите фронтенд: `npm run dev`
3. Откройте `/presentation` в браузере
4. Заполните форму и нажмите "Создать презентацию"

### Production (Netlify):

1. Убедитесь, что переменные окружения настроены в Netlify Dashboard
2. Deploy на Netlify
3. Все должно работать автоматически

---

## 🔍 Проверка работы:

1. Убедитесь, что OpenAI API ключ правильный
2. Проверьте, что таблица `presentations` создана в базе данных
3. Проверьте консоль браузера на ошибки
4. Проверьте логи сервера (локально) или Netlify Functions (production)

---

## ⚠️ Важные замечания:

1. **Модель по умолчанию:** `gpt-4o-mini` (дешево, но качество JSON может быть ниже)
2. **Для лучшего качества JSON:** Установите `OPENAI_MODEL=gpt-4o` (дороже, но надежнее)
3. **Валидация:** API пытается парсить JSON, но если формат неправильный - может быть ошибка
4. **Стоимость:** См. файлы `AI_COST_SINGLE_USER.md` и `AI_RECOMMENDATIONS_START.md`

---

## ✅ Статус:

**Презентации полностью готовы к использованию!**

Осталось только:
1. ✅ Создать таблицу в БД (SQL скрипт готов)
2. ✅ Настроить OpenAI API ключ
3. ✅ Протестировать генерацию

Всё остальное уже реализовано! 🎉
