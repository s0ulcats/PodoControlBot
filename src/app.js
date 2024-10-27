const TelegramBot = require('node-telegram-bot-api');
const cfg = require('./cfg.js');
const mysql = require('mysql2');
const Sequelize = require('sequelize');
const helper = require('./helper.js');
const kb = require('./keyboardButtons.js');
const keyboard = require('./keyboard.js');
//const db = require('./db/dataModel.js');
//const Model = db.podocontrol;
const chatId = helper.getChatId;
const moment = require('moment');
const failedTime = require('./failed.js');
const failed = require('./failed.js');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'podocontrol'
  });

connection.connect((err) => {
    if (err) {
      console.error('Ошибка подключения к базе данных: ' + err.stack);
      return;
    }
    console.log('Подключение к базе данных успешно.');
});

helper.logStart();

const bot = new TelegramBot(cfg.TOKEN, {
    polling: true
})

bot.onText('/start', msg => {
    const text = `Добро пожаловать ${msg.from.first_name}❤`
    bot.sendSticker(chatId(msg), 'https://tlgrm.ru/_/stickers/2e3/9fc/2e39fcfc-7fb0-3b20-b6fe-4009349d05ef/1.webp');
    bot.sendMessage(chatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
})

bot.on('message', msg => {
    console.log('Working...', msg.from.first_name);

    switch(msg.text){
        case kb.home.Procedurs:
            bot.sendMessage(chatId(msg), `Виберіть, будь ласка, процедуру`,{
                reply_markup: {keyboard: keyboard.procedurs}
            })
            break
        case kb.back:
            bot.sendMessage(chatId(msg), `Виберіть, будь ласка, команду`, {
                reply_markup: {keyboard: keyboard.home}
            })
            break
        case kb.procedursBack:
            bot.sendMessage(chatId(msg), `Виберіть, будь ласка, процедуру`), {
                reply_markup: {keyboard: keyboard.allProcedurs}
            }
        case kb.Cb:
            bot.sendMessage(chatId(msg), `Добрий день, якщо у вас з'явились питання, ви можете написати @podo_control або зателефонувати за номером +38(050)-733-50-98\nP.s. Якщо помітили якісь поломки або баг у боті, повідомте, будь ласка, @s0ulcats`,{
                reply_markup: {keyboard: keyboard.back}
            })
            bot.sendSticker(chatId(msg), 'https://tlgrm.ru/_/stickers/348/e30/348e3088-126b-4939-b317-e9036499c515/2.webp');
            break
        case kb.procedurs.pedecur:
            bot.sendMessage(chatId(msg), `Ви вибрали процедуру 'Педикюр', виберіть, будь ласка, дату та час, які вам підходять найбільше`, {
                reply_markup: {keyboard: keyboard.allProcedurs}
            })
            break
        case kb.procedurs.manicur:
            bot.sendMessage(chatId(msg), `Ви вибрали процедуру 'Манікюр', виберіть, будь ласка, дату та час, які вам підходять найбільше`, {
                reply_markup: {keyboard: keyboard.allProcedurs}
            })
            break
        case kb.procedurs.podoView:
            bot.sendMessage(chatId(msg), `Ви вибрали процедуру 'Професіональний подологічний огляд', виберіть, будь ласка, дату та час, які вам підходять найбільше`, {
                reply_markup: {keyboard: keyboard.allProcedurs}
            })
            break
        case kb.spisokProcedur:
            bot.sendMessage(chatId(msg), `Список доступних процедур`, {
                reply_markup: {keyboard: keyboard.procedurs}
            })
        case kb.BusyDates:
            bot.once('message', async (msg) => {
                await bot.sendMessage(chatId(msg), `Будь ласка, введіть дату і час у форматі: ДД.ММ ЧЧ:ММ`, {
                    reply_markup: {keyboard: keyboard.back}
                });
        
                bot.once('message', async (msg) => {
                    console.log('Received message:', msg.text);
        
                    if (msg.text && msg.text !== 'Процедури' && msg.text !== 'Повернутися' && msg.text !== 'Список процедур' && msg.text !== 'Зв\'язатися з керівництвом' && msg.text !== 'Записатися' && msg.text !== 'Манікюр' && msg.text !== 'Педикюр' && msg.text !== 'Професіональний подологічний огляд' && msg.text !== '/start') {
                        const input = msg.text.split(/(?:,|\s{2,}|\s|\n)+/);
                        const datee = input[0];
                        const timee = input[1];
        
                        console.log('Parsed date and time:', datee, timee);
        
                        const selectSql = `SELECT name, procedura FROM zapici WHERE datee = ? AND timee = ?`;
        
                        try {
                            const [rows] = await connection.promise().query(selectSql, [datee, timee]);
        
                            console.log('Query results:', rows);
        
                            if (rows.length === 0) {
                                await bot.sendMessage(chatId(msg), `На цю дату та час немає записів.`);
                            } else {
                                let response = `Записи на ${datee} ${timee}:\n`;
                                rows.forEach((record, index) => {
                                    response += `${index + 1}. ${record.name} - ${record.procedura}\n`;
                                });
                                await bot.sendMessage(chatId(msg), response);
                            }
                        } catch (err) {
                            console.error('Error executing query:', err);
                            await bot.sendMessage(chatId(msg), `Приносимо вибачення, сталася помилка при отриманні записів. Відпишіть, будь ласка, @s0ulcats`);
                        }
                    }
                });
            });
            break;
        case kb.record:
            bot.sendMessage(chatId(msg), "Заповніть, будь ласка, форму\nІм'я\nНомер телефону\nПроцедура\nДата\nЧас\nP.s. пишіть, будь ласка, все одним повідомленням. Час прийому з 8 до 18:30 (різниця між прийомом 1:30 год). Прохання перед записом перевіряти, чи є запис на цей час та дату (інакше база не запише вас на прийом). Дякую❤️", {
                reply_markup: { keyboard: keyboard.spisokProcedur }
            });

            const messageHandler = async (msg) => {
                const messageText = msg.text.trim();
                if (messageText && !["Процедури", "Зайняті дати та час", "Повернутися", "Список процедур", "Зв'язатися з керівництвом", "Записатися", "Манікюр", "маникюр", "Педикюр", "Професіональний подологічний огляд", "Зайняті дати та час", "/start"].includes(messageText)) {
                    const userData = messageText.split(/\s+/);
                    if (userData.length === 5) {
                        const [name, phoneNumber, procedura, datee, timee] = userData;

                        // Проверяем, занято ли уже указанное время
                        const checkSql = `SELECT COUNT(*) AS count FROM zapici WHERE datee = ? AND timee = ?`;
                        const [results] = await connection.promise().query(checkSql, [datee, timee]);

                        if (results[0].count > 0) {
                            bot.sendMessage(chatId(msg), "На жаль, на цю дату та час вже є запис. Будь ласка, оберіть інший час.");
                        } else {
                            // Проверка на процедуру "Манікюр" или "маникюр"
                            if (procedura.toLowerCase() === "манікюр" || procedura.toLowerCase() === "маникюр" || procedura.toLowerCase() === "manikur" || procedura.toLowerCase() === "manicur") {
                                const selectManicureSql = `SELECT timee FROM zapici WHERE datee = ? AND procedura IN ('Манікюр', 'маникюр')`;
                                const [manicureResults] = await connection.promise().query(selectManicureSql, [datee]);

                                if (manicureResults.length > 0) {
                                    const lastManicureTime = manicureResults[manicureResults.length - 1].timee;
                                    const lastManicureMoment = moment(lastManicureTime, "HH:mm");
                                    const userTimeMoment = moment(timee, "HH:mm");

                                    if (userTimeMoment.diff(lastManicureMoment, 'minutes') < 30) {
                                        bot.sendMessage(chatId(msg), "Після процедури 'Манікюр' час запису має бути через 30 хвилин. Будь ласка, оберіть інший час.");
                                        return;
                                    }
                                }
                            }

                            const sql = `INSERT INTO zapici (name, phoneNumber, procedura, datee, timee) VALUES (?, ?, ?, ?, ?)`;
                            connection.query(sql, [name, phoneNumber, procedura, datee, timee], (err, result) => {
                                if (err) {
                                    bot.sendMessage(chatId(msg), 'Приносимо пробачення, при занесенні данних була видана помилка, відпишіть будь ласка @s0ulcats');
                                } else {
                                    bot.sendMessage(chatId(msg), 'Дякуємо за запис❤️\nЯкщо будуть питання, пишіть @podo_control');
                                    bot.sendSticker(chatId(msg), 'https://cdn.tlgrm.ru/stickers/370/545/37054570-0c95-46d1-940a-589cf00b2410/192/1.webp');
                                }
                            });
                        }
                    } else {
                        bot.sendMessage(chatId(msg), 'Будь ласка, заповніть всі поля форми: Ім\'я, Номер телефону, Процедура, Дата, Час.');
                    }
                }
            };

            // Удаляем предыдущий обработчик и регистрируем новый
            bot.removeListener('message', messageHandler);
            bot.on('message', messageHandler);
            break;
        case kb.recordings:
            if (msg.from.username) {
                const selectAllSql = `SELECT name, phoneNumber, procedura, datee, timee FROM zapici`;
                
                connection.query(selectAllSql, (err, results) => {
                    if (err) {
                        bot.sendMessage(chatId(msg), 'Виникла помилка при отриманні записів з бази даних. Відпишіть будь ласка @s0ulcats');
                        console.error('Error executing query:', err);
                    } else {
                        if (results.length > 0) {
                            let response = 'Записи:\n\n';
                            results.forEach((record, index) => {
                                response += `${index + 1}. Ім'я: ${record.name}, Телефон: ${record.phoneNumber}, Процедура: ${record.procedura}, Дата: ${record.datee}, Час: ${record.timee}\n`;
                            });
                            bot.sendMessage(chatId(msg), response);
                        } else {
                            bot.sendMessage(chatId(msg), 'Записів у базі даних не знайдено.');
                        }
                    }
                });
            } else {
                bot.sendMessage(chatId(msg), `Вибачте, у вас немає доступу до цієї функції.`);
            }
            break;
        }
})