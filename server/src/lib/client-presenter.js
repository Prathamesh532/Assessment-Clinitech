export function presentClient(row) {
  return {
    id: row.client_id,
    fullName: row.full_name,
    email: row.email,
    mobile: row.mobile,
    city: row.city,
    state: row.state,
    age: row.age,
    gender: row.gender,
    occupation: row.occupation,
    healthCondition: row.health_condition,
    beautyGoal: row.beauty_goal,
    sourceCreatedAt: row.created_at,
    ...(row.report_count !== undefined ? { _count: { reports: Number(row.report_count) } } : {}),
  };
}
