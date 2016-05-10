server 'pr2.linlabs.se', user: 'deployer', roles: %w{app db web}

set :branch, "master"
set :environment, "staging"
set :default_env, { 
  'NODE_ENVIRONMENT' => 'staging'
}