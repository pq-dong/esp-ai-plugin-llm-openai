# esp-ai-plugin-llm-openai

让 ESP-AI 支持 openai

# 安装
在你的 `ESP-AI` 项目中执行下面命令
```
npm i esp-ai-plugin-llm-openai
```

# 使用 
```js
const espAi = require("esp-ai"); 

espAi({
    ... 

    // 配置使用插件并且为插件配置api-key
    llm_server: "esp-ai-plugin-llm-openai",
    llm_config: {
        api_key: "sk-xxx", 
        model: 'gpt-4o-mini'
    },

    // 引入插件
    plugins: [ 
        require("esp-ai-plugin-llm-openai")
    ]
});
```
