const TelegramBot = require('node-telegram-bot-api');
const cfg = require('./cfg.js');
const mysql = require('mysql');
const Sequelize = require('sequelize');
const helper = require('./helper.js');
const kb = require('./keyboardButtons.js');
const keyboard = require('./keyboard.js');
//const db = require('./db/dataModel.js');
//const Model = db.podocontrol;
const chatId = helper.getChatId;
const moment = require('moment');

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
            bot.sendMessage(chatId(msg), `Будь ласка, введіть дату і час у форматі: ДД.ММ ЧЧ:ММ`, {
                reply_markup: {keyboard: keyboard.back}
            })
            bot.on('message', (msg) => {
            if (msg.text && msg.text !== 'Процедури' && msg.text !== 'Повернутися' && msg.text !== 'Список процедур' && msg.text !== 'Зв\'язатися з керівництвом' && msg.text !== 'Записатися' && msg.text !== 'Манікюр' && msg.text !== 'Педикюр' && msg.text !== 'Професіональний подологічний огляд' && msg.text !== '/start') {
                const input = msg.text.split(/(?:,|\s{2,}|\s|\n)+/);
                const datee = input[0];
                const timee = input[1];

                const selectSql = `SELECT name, procedura FROM zapici WHERE datee = ? AND timee = ?`;
                connection.query(selectSql, [datee, timee], (err, results) => {
                    if (err) {
                        bot.sendMessage(chatId(msg), `Приносимо вибачення, сталася помилка при отриманні записів. Відпишіть, будь ласка, @s0ulcats`);
                    } else if (results.length === 0) {
                        bot.sendMessage(chatId(msg), `На цю дату та час немає записів.`);
                    } else {
                        let response = 'Записи на ' + datee + ' ' + timee + ':\n';
                        results.forEach((record, index) => {
                            response += `${index + 1}. ${record.name} - ${record.procedura}\n`;
                        });
                        bot.sendMessage(chatId(msg), response);
                    }
                });
            }
            });
            break
        case kb.record:
            bot.sendMessage(chatId(msg), `Заповніть, будь ласка, форму\nІм'я\nНомер телефону\nПроцедура\nДата\nЧас\nP.s. пишіть, будь ласка, все одним повідомленням. Час прийому з 8 до 18:30 (різниця між прийомом 1:30 год). Прохання перед записом перевіряти, чи є запис на цей час та дату (інакше база не запише вас на прийом). Дякую❤️`, {
                reply_markup: {keyboard: keyboard.spisokProcedur}
            });
        
            // Ожидаем ответа от пользователя
            bot.on('message', (msg) => {
                if (msg.text && msg.text !== 'Процедури' && msg.text !== 'Зайняті дати та час' && msg.text !== 'Повернутися' && msg.text !== 'Список процедур' && msg.text !== 'Зв\'язатися з керівництвом' && msg.text !== 'Записатися' && msg.text !== 'Манікюр' && msg.text !== 'Педикюр' && msg.text !== 'Професіональний подологічний огляд' && msg.text !== 'Зайняті дати та час' && msg.text !== '/start') {
                    // Извлекаем данные из сообщения
                    const userData = {
                        name: msg.text.split(/(?:,|\s{2,}|\s|\n)+/)[0],
                        phoneNumber: msg.text.split(/(?:,|\s{2,}|\s|\n)+/)[1],
                        procedura: msg.text.split(/(?:,|\s{2,}|\s|\n)+/)[2],
                        datee: msg.text.split(/(?:,|\s{2,}|\s|\n)+/)[3],
                        timee: msg.text.split(/(?:,|\s{2,}|\s|\n)+/)[4]
                    };
        
                    if (userData.name && userData.phoneNumber && userData.procedura && userData.datee && userData.timee) {
                        // Проверяем, занято ли уже указанное время
                        const checkSql = `SELECT COUNT(*) AS count FROM zapici WHERE datee = ? AND timee = ?`;
                        connection.query(checkSql, [userData.datee, userData.timee], (err, results) => {
                            if (err) {
                                bot.sendMessage(chatId(msg), `Приносимо пробачення, сталася помилка при перевірці наявності дати та часу. Відпишіть будь ласка @s0ulcats`);
                            } else {
                                const count = results[0].count;
                                if (count > 0) {
                                    bot.sendMessage(chatId(msg), `На жаль, на цю дату та час вже є запис. Будь ласка, оберіть інший час.`);
                                } else {
                                    // Вставляем новую запись, если время свободно
                                    const sql = `INSERT INTO zapici (name, phoneNumber, procedura, datee, timee) VALUES (?, ?, ?, ?, ?)`;
                                    connection.query(sql, [userData.name, userData.phoneNumber, userData.procedura, userData.datee, userData.timee], (err, result) => {
                                        if (err) {
                                            bot.sendMessage(chatId(msg), 'Приносимо пробачення, при занесенні данних була видана помилка, відпишіть будь ласка @s0ulcats');
                                        } else {
                                            bot.sendMessage(chatId(msg), 'Дякуємо за запис❤️\nЯкщо будуть питання, пишіть @podo_control');
                                            bot.sendSticker(chatId(msg), 'https://cdn.tlgrm.ru/stickers/370/545/37054570-0c95-46d1-940a-589cf00b2410/192/1.webp');
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        bot.sendMessage(chatId(msg), 'Будь ласка, заповніть всі поля форми: Ім\'я, Номер телефону, Процедура, Дата, Час.');
                    }
                }
            });
            break;
        }
})