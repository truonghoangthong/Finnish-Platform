// utils/calculateProgress.js

/**
 * Calculates total module progress based on user interaction and correctness.
 * Each part (A or B) contributes:
 *   - 25% if viewed/interacted
 *   - +25% if all answers correct
 * Total: up to 100%
 */

export const calculateModule1Progress = ({
  part1aViewed = false,
  part1aCorrect = false,
  part1bViewed = false,
  part1bCorrect = false,
}) => {
  let progress = 0;
  if (part1aViewed) progress += 25;
  if (part1aCorrect) progress += 25;
  if (part1bViewed) progress += 25;
  if (part1bCorrect) progress += 25;
  return progress;
};

export const calculateModule2Progress = ({
  part2aViewed = false,
  part2aCorrect = false,
  part2bViewed = false,
  part2bCorrect = false,
}) => {
  let progress = 0;
  if (part2aViewed) progress += 25;
  if (part2aCorrect) progress += 25;
  if (part2bViewed) progress += 25;
  if (part2bCorrect) progress += 25;
  return progress;
};
