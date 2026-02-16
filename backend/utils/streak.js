const updateStreak = (user) => {
   const today = new Date().toDateString();
   const last = user.lastCompletedDate?.toDateString();

   if (!last) {
      user.streak = 1;
   } else if (last !== today) {
      user.streak += 1;
   }

   user.lastCompletedDate = new Date();
};

module.exports = updateStreak;
