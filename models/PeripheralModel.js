const { Schema, model } = require('mongoose');

const PeripheralSchema = new Schema({
    uart1: {
        type: Array,
        require: true
    },
    uart4:{
        type: Array,
        require: true,
    },
    i2c:{
        type: Array,
        require: true,
    },
    SPI:{
        type: Array,
        require: true,
    },
    GPIO_49:{
        type: Array,
        require: true,
    },
    GPIO_60:{
        type: Array,
        require: true,
    },
    GPIO_117:{
        type: Array,
        require: true,
    },
    GPIO_115:{
        type: Array,
        require: true,
    },
    GPIO_112:{
        type: Array,
        require: true,
    },
    GPIO_20:{
        type: Array,
        require: true,
    },
    GPIO_66:{
        type: Array,
        require: true,
    },
    GPIO_69:{
        type: Array,
        require: true,
    },
    GPIO_45:{
        type: Array,
        require: true,
    },
    GPIO_47:{
        type: Array,
        require: true,
    },
    GPIO_27:{
        type: Array,
        require: true,
    },
    GPIO_67:{
        type: Array,
        require: true,
    },
    GPIO_68:{
        type: Array,
        require: true,
    },
    GPIO_44:{
        type: Array,
        require: true,
    },
    GPIO_26:{
        type: Array,
        require: true,
    },
    GPIO_46:{
        type: Array,
        require: true,
    },
    GPIO_65:{
        type: Array,
        require: true,
    },
    GPIO_61:{
        type: Array,
        require: true,
    },
    PWM0:{
        type: Array,
        require: true,
    },
    PWM1A:{
        type: Array,
        require: true,
    },
    PWM1B:{
        type: Array,
        require: true,
    },
    PWM2A:{
        type: Array,
        require: true,
    },
    PWM2B:{
        type: Array,
        require: true,
    },
    AIN0:{
        type: Array,
        require: true,
    },
    AIN1:{
        type: Array,
        require: true,
    },
    AIN2:{
        type: Array,
        require: true,
    },
    AIN3:{
        type: Array,
        require: true,
    },
    AIN4:{
        type: Array,
        require: true,
    },
    AIN5:{
        type: Array,
        require: true,
    },
    AIN6:{
        type: Array,
        require: true,
    },
});

const PeripheralModel = model('PeripheralItem', PeripheralSchema );

module.exports = PeripheralModel;