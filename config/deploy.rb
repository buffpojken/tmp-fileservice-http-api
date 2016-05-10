# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'files.pr2'
set :repo_url, 'git@github.com:buffpojken/tmp-fileservice-http-api.git'

set :deploy_to, "/sites/#{fetch(:application)}"

set :scm, :git

# Default value for :linked_files is []
# set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'node_modules', 'public/system', 'uploads')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do

	desc 'Restart application'
	task :restart do
	  on roles(:app) do
	    sudo :service, fetch(:application), 'restart'
	  end
	end

	task :start do 
		on roles(:app) do 
			sudo :service, fetch(:application), 'start'
		end
	end

	desc 'Install node modules'
	task :install_node_modules do
	  on roles(:app) do
	    within release_path do
	      execute :npm, 'install', '-s'
	    end
	  end
	end

	after :updated, :install_node_modules

	# See lib/capistrano/tasks/database.rake for definition
	
	after :publishing, :restart
end

before "deploy:started", "maintenance:enable"
after "deploy:finished", "maintenance:disable"