const stories = [
  {
    title: "Бонус 3000₽!",
    description: "Стартовая выплата для новых курьеров",
    imageUrl: "https://cdn.poehali.dev/files/da2d6308-de5f-45ad-ae8d-3ed07b41fcd9.jpg",
    buttonText: "Подать заявку",
    buttonLink: "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank",
    position: 0,
    animationType: "falling",
    animationConfig: {
      fallingImage: "https://cdn.poehali.dev/files/047dd184-97dc-4d08-8be6-0b6782b11d60.jpg",
      fallingCount: 20,
      fallingSpeed: 80
    }
  },
  {
    title: "Приведи друга",
    description: "Получай до 50,000₽ за каждого приглашенного курьера",
    imageUrl: "https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg",
    buttonText: "Узнать больше",
    buttonLink: "/career",
    position: 1,
    animationType: "jumping",
    animationConfig: {
      jumpingImage: "https://cdn.poehali.dev/files/01665182-15dc-4b4f-a2bd-8b021378fdea.png",
      jumpingPosition: "bottom-left"
    }
  },
  {
    title: "Играй и зарабатывай!",
    description: "Собирай купюры в игре и выводи реальные деньги",
    imageUrl: "https://cdn.poehali.dev/files/f7d91ef6-30ea-482e-89db-b5857fec9312.jpg",
    buttonText: "Начать игру",
    buttonLink: "/",
    position: 2,
    animationType: "falling",
    animationConfig: {
      fallingImage: "https://cdn.poehali.dev/files/047dd184-97dc-4d08-8be6-0b6782b11d60.jpg",
      fallingCount: 25,
      fallingSpeed: 60
    }
  }
];

async function createStories() {
  const url = 'https://functions.poehali.dev/f225856e-0853-4f67-92e5-4ff2a716193e';

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
        console.log(`✅ Создана история: ${story.title}`);
      } else {
        console.error(`❌ Ошибка создания ${story.title}:`, data);
      }
    } catch (error) {
      console.error(`❌ Ошибка создания ${story.title}:`, error);
    }
  }

  console.log('\n🎉 Готово! Истории созданы.');
}

createStories();
