class AddBelongsToPathOnNode < ActiveRecord::Migration
  	change_table :nodes do |t|
	  t.belongs_to :path
	end
end
