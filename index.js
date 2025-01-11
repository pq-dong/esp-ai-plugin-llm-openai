const {OpenAI} = require("openai");

module.exports = {
    // 插件名字
    name: "esp-ai-plugin-llm-openai",
    // 插件类型 LLM | TTS | IAT
    type: "LLM",
    main({
             devLog,
             device_id,
             llm_config,
             text,
             llmServerErrorCb,
             llm_init_messages = [],
             llm_historys = [],
             cb,
             llm_params_set,
             logWSServer,
             connectServerBeforeCb,
             connectServerCb,
             log
         }) {
        try {
            const {apiKey, model, ...other_config} = llm_config;

            if (!apiKey) return log.error("请配给 LLM 配置 apiKey 参数。");
            if (!model) return log.error("请配给 LLM 配置 model 参数。");


            const openai = new OpenAI({
                apiKey: apiKey
            });
            let shouldClose = false;

            const texts = {
                all_text: "",
                count_text: "",
                index: 0,
            };

            connectServerBeforeCb();

            const messages = [
                ...llm_init_messages,
                ...llm_historys,
                {role: "user", content: text},
            ];

            const payload = {
                model: model, // Ensure model is set, e.g., 'gpt-3.5-turbo'
                messages: messages,
                ...other_config,
            };

            const params = llm_params_set ? llm_params_set(payload) : payload;

            devLog && log.llm_info("-> 调用 OpenAI 接口...");
            async function main(){
                try {

                    const completion = await openai.chat.completions.create(params);
                    resultData = completion.choices[0].message.content
                    devLog && log.llm_info("-> OpenAI接口输出：");
                    devLog && log.llm_info(resultData);

                    connectServerCb(true);
                    logWSServer({
                        close: () => {
                            connectServerCb(false);
                            shouldClose = true;
                        },
                    });

                    if (shouldClose) return;
                    const chunk_text = resultData
                    texts["count_text"] = chunk_text;
                    cb({
                        text,
                        is_over: true,
                        texts,
                        shouldClose,
                        chunk_text: chunk_text
                    })
                }catch (error){
                    devLog && log.llm_info("-> 调用 OpenAI 异常");
                    devLog && log.llm_info(error);
                    llmServerErrorCb("OpenAI LLM 报错: " + error)
                    connectServerCb(false);
                }
            }
            main()

        } catch (error) {
            devLog && log.llm_info("-> 调用 OpenAI 错误");
            devLog && log.llm_info(error);
            llmServerErrorCb(`OpenAI LLM 错误: ${error.message}`);
            connectServerCb(false);
        }
    }
};
