class GraphController < ApplicationController
	def index
		subpaths = Hash.new
		subpaths[1] = [1]

		paths = Hash.new

		sink = Node.last.number

		i = 1
		while i <= subpaths.length do
			last_node = subpaths[i].last
			if last_node == sink
				paths[paths.length + 1] = subpaths[i]
  			else
  				tail = Node.where('number = ?', last_node).first
  				if tail
  					arcs = Arc.where(tail_id: tail.id)
  					arcs.each do |arc|
  						unless subpaths[i].include?(arc.head.number)
  							new_path = subpaths[i] + [arc.head.number]
  							subpaths[subpaths.length + 1] = new_path
  						end
  					end
  				end
  			end
  			i += 1
		end

		paths.each do |key, array|
			path = Path.new
			path.max_flow = 99999999
			for i in 0..array.length - 1
				tail = Node.where(number: array[i]).first
				head = Node.where(number: array[i + 1]).first
				path.nodes << tail
				if head
					arc = Arc.where('tail_id = ? AND head_id = ?', tail.id, head.id).first
					if arc.flow < path.max_flow
						path.max_flow = arc.flow
					end
				end
			end
			puts path.nodes
			path.save if !path.nodes.empty? && path.max_flow #Only last path has nodes
		end
	end
end
