import sqlite3 as db
import datetime
import math
import psutil
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder="static")
# Подключение к БД
con = db.connect('cpudata.db', check_same_thread=False)
cur = con.cursor()
# Создаем таблицу в БД, если еще не создана
cur.execute("CREATE TABLE IF NOT EXISTS info(cpu VARCHAR(5), time timestamp);")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get', methods=['POST', 'GET'])
def get():
    if request.method == 'GET':
        cur = con.cursor()
        # Берем все данные из БД
        cur.execute("SELECT * FROM info")
        all_data = cur.fetchall()
        cur.close()
        dif_hour = datetime.datetime.now() - datetime.timedelta(hours=1)
        # Если есть данные в таблице, то проверяем, когда была последняя запись в БД
        if all_data:
            ans = []
            # Добавляем в массив значения time из БД
            for _, j in enumerate(all_data):
                ans.append(j[1])
            # Меняем тип данных последней записи в массиве на datetime 
            last_in_time = datetime.datetime.strptime(ans[-1], '%Y-%m-%d %H:%M:%S.%f')    
            # Если последняя запись была больше часа назад, то удаляем все данные
            if last_in_time < dif_hour:
                cur = con.cursor()
                cur.execute("DELETE FROM info")
                con.commit()
                cur.close()
            else:
                time_diff = datetime.datetime.now() - last_in_time
                time_5 = datetime.timedelta(seconds=5)
                # Пока сервер был выключен, записываем 0 в cpu
                while time_diff > time_5:
                    time_add = (datetime.datetime.now() - time_diff) + time_5
                    cpu_add = str(0)
                    cur = con.cursor()
                    cur.execute("INSERT INTO info (cpu, time) values (?, ?)", (cpu_add, time_add))
                    # Сокращаем время на 5 секунд
                    time_diff -= time_5
                    if time_diff <= time_5:
                        con.commit()
                        cur.close()
        # Получаем величину загрузки процессора, текущее время и сохраняем
        cpu_data = psutil.cpu_percent(interval=1)
        time_data = datetime.datetime.now()
        cur = con.cursor()
        cur.execute("INSERT INTO info (cpu, time) values (?, ?)", (cpu_data, time_data))
        con.commit()
        
        cur.execute("SELECT * FROM info")
        all_data = cur.fetchall()
        cur.close()
        # Словарь для записи величин загрузки процессора
        res_m = {}
        # Для дальнейшего вычисления среднего значения
        arr = []
        for i, j in enumerate(all_data):
            cpu_num = eval(j[0][0])
            arr.append(cpu_num)
            res_m[i+1] = cpu_num
        
        values_len = len(arr)
        # Словарь со средней величиной загрузки процессора за 1 минту
        res_avg = {}
        # Вычисление средней величины загрузки процессора за 1 минуту
        if values_len / 12 >= 1:
            # Количество минут
            num_minutes = math.floor(values_len/12)
            avg = 0
            for n in range(num_minutes):
                for m in range(12):
                    # Находим общее количество загрузки процессора за 1 минуту
                    avg += int(arr[m + 12 * n])
                # Получаем среднее значение и сохраняем в словарь
                avg = math.floor(avg/12)
                res_avg[n+1] = avg

    return jsonify(res_m, res_avg)


if  __name__ == '__main__':
    app.run()