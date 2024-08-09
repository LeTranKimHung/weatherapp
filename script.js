async function createModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [3] }));
    model.add(tf.layers.dense({ units: 3 })); // Dự đoán nhiệt độ, độ ẩm, tốc độ gió

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    return model;
}

async function trainModel(model, data) {
    const xs = tf.tensor2d(data.inputs);
    const ys = tf.tensor2d(data.labels);

    await model.fit(xs, ys, { epochs: 10 });
}

async function predictWeather(model, inputData) {
    const inputTensor = tf.tensor2d([inputData]);
    const prediction = model.predict(inputTensor);
    return prediction.array(); // Sử dụng array() thay vì dataSync() để nhận kết quả dạng array
}

const weatherData = {
    inputs: [
        [30, 60, 5],
        [32, 70, 7],
        [28, 80, 10],
        [29, 65, 6],
        [31, 55, 8]
    ],
    labels: [
        [28, 60, 5],
        [30, 70, 7],
        [27, 80, 10],
        [29, 65, 6],
        [30, 55, 8]
    ]
};

async function initialize() {
    try {
        const model = await createModel();
        await trainModel(model, weatherData);

        document.getElementById('submit-button').addEventListener('click', async () => {
            const city = document.getElementById('search-input').value;
            if (!city) {
                document.querySelector('.city-name').textContent = '--';
                document.querySelector('.temperature').textContent = '--';
                document.querySelector('#sunrise').textContent = '--';
                document.querySelector('#sunset').textContent = '--';
                document.querySelector('#humidity').textContent = '--';
                document.querySelector('#wind-speed').textContent = '--';
                return;
            }

            // Dữ liệu đầu vào để dự đoán
            const inputData = [30, 60, 5]; // Ví dụ, nhiệt độ và các yếu tố khác
            const prediction = await predictWeather(model, inputData);

            // Cập nhật giao diện người dùng với dự đoán
            document.querySelector('.city-name').textContent = city || '--';
            const [temp, humidity, windSpeed] = prediction[0]; // Lấy giá trị dự đoán từ mảng

            document.querySelector('.temperature').textContent = (Math.round(temp) >= 0 ? Math.round(temp) : 0) || '--';
            document.querySelector('#sunrise').textContent = '06:00'; // Ví dụ, giá trị mặc định
            document.querySelector('#sunset').textContent = '18:00'; // Ví dụ, giá trị mặc định
            document.querySelector('#humidity').textContent = (Math.round(humidity) >= 0 ? Math.round(humidity) : 0) || '--';
            document.querySelector('#wind-speed').textContent = (Math.round(windSpeed) >= 0 ? Math.round(windSpeed) : 0) || '--';
        });
    } catch (error) {
        console.error('Error initializing model:', error);
    }
}

// Khởi tạo mô hình và dữ liệu
initialize();
