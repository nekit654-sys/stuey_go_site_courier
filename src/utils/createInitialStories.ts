export async function createInitialStories() {
  const stories = [
    {
      title: "Бонус 5,000₽ 🎁",
      description: "Получи 5,000₽ за первые 50 заказов! Работаешь курьером — получаешь бонус от нас",
      imageUrl: "https://cdn.poehali.dev/files/da2d6308-de5f-45ad-ae8d-3ed07b41fcd9.jpg",
      buttonText: "Узнать условия",
      buttonLink: "/dashboard",
      position: 0,
      animationType: "falling",
      animationConfig: {
        fallingImage: "https://cdn.poehali.dev/files/047dd184-97dc-4d08-8be6-0b6782b11d60.jpg",
        fallingCount: 20,
        fallingSpeed: 80
      }
    },
    {
      title: "Приводи друзей 💰",
      description: "Приводи друзей — зарабатывай больше! Твоя реферальная ссылка = дополнительный доход",
      imageUrl: "https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg",
      buttonText: "Получить ссылку",
      buttonLink: "/dashboard",
      position: 1,
      animationType: "jumping",
      animationConfig: {
        jumpingImage: "https://cdn.poehali.dev/files/01665182-15dc-4b4f-a2bd-8b021378fdea.png",
        jumpingPosition: "bottom-left"
      }
    },
    {
      title: "Соревнуйся в играх 🎮",
      description: "Соревнуйся с другими курьерами! 2D и 3D игры + таблица лидеров",
      imageUrl: "https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg",
      buttonText: "Играть сейчас",
      buttonLink: "/games",
      position: 2,
      animationType: "falling",
      animationConfig: {
        fallingImage: "https://cdn.poehali.dev/files/047dd184-97dc-4d08-8be6-0b6782b11d60.jpg",
        fallingCount: 25,
        fallingSpeed: 60
      }
    },
    {
      title: "Личный кабинет 📊",
      description: "Вся статистика в одном месте: Заказы • Выплаты • Рефералы • Бонусы",
      imageUrl: "https://cdn.poehali.dev/files/da2d6308-de5f-45ad-ae8d-3ed07b41fcd9.jpg",
      buttonText: "Открыть кабинет",
      buttonLink: "/dashboard",
      position: 3,
      animationType: "none",
      animationConfig: {}
    },
    {
      title: "Поддержка 24/7 💬",
      description: "Есть вопросы? Пиши в Telegram! Ответим за 5 минут, помогаем 24/7",
      imageUrl: "https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg",
      buttonText: "Написать в поддержку",
      buttonLink: "https://t.me/StueyGoBot?start=support",
      position: 4,
      animationType: "jumping",
      animationConfig: {
        jumpingImage: "https://cdn.poehali.dev/files/01665182-15dc-4b4f-a2bd-8b021378fdea.png",
        jumpingPosition: "bottom-right"
      }
    }
  ];

  const url = 'https://functions.poehali.dev/687c4b0c-583b-4365-9d89-755ef27059e3';

  for (const story of stories) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Создана история: ${story.title}`, data);
      } else {
        console.error(`❌ Ошибка создания ${story.title}:`, data);
      }
    } catch (error) {
      console.error(`❌ Ошибка создания ${story.title}:`, error);
    }
  }

  console.log('🎉 Готово! Истории созданы.');
}