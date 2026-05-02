DELETE FROM Sweepstake_logs WHERE Sweepstake_logs.sweepstake_name = 'sweepstake test api' or Sweepstake_logs.sweepstake_name = 'sweepstake test api 2';
DELETE FROM Sweepstake_users WHERE Sweepstake_users.sweepstake_name = 'sweepstake test api' or Sweepstake_users.sweepstake_name = 'sweepstake test api 2';
DELETE FROM Sweepstake WHERE Sweepstake.name ='sweepstake test api' or Sweepstake.name ='sweepstake test api 2';
DELETE FROM Users WHERE Users.name='user test api sweeps';