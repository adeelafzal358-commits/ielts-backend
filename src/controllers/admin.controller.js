const getDashboardStats = async (req, res) => {
  try {

    res.status(200).json({
      success: true,
      message: "Admin Dashboard Working",
      stats: {
        totalUsers: 0,
        totalCandidates: 0,
        totalTests: 0
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getDashboardStats
};