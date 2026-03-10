mod council;
mod direct_chat;
mod formatting;
mod handlers;
mod state;

use teloxide::prelude::*;
use handlers::Command;
use state::AppState;

#[tokio::main]
async fn main() {
    env_logger::init();
    log::info!("Starting Council of AI Agents Telegram Bot...");

    let bot = Bot::from_env();
    let app_state = AppState::new();

    log::info!("Bot initialized. Listening for commands...");

    let handler = Update::filter_message()
        .branch(
            dptree::entry()
                .filter_command::<Command>()
                .endpoint(handlers::handle_command),
        )
        .branch(dptree::entry().endpoint(handlers::handle_message));

    Dispatcher::builder(bot, handler)
        .dependencies(dptree::deps![app_state])
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}
