class GraphController < ApplicationController
	def index
	 	@total_max_flow = 0

	 	arcs = Arc.all
	 	arcs.each do |arc|
			arc.update_attributes(flow: arc.initial_flow)
		end

		paths = find_all_paths

		save_all_paths(paths)

		done = false
		selected_paths = []
		while !paths.empty? && !done
			max_flow = Path.maximum(:max_flow)
			if max_flow > 0
				selected_path = Path.where(max_flow: max_flow).first
				arcs = selected_path.arcs
				for i in 0..arcs.length - 1
					forward_arc = arcs[i]
					backward_arc = arcs[i].reverse_arc
					
					new_forward_flow = forward_arc.flow - max_flow
					new_backward_flow = backward_arc.flow + max_flow

					forward_arc.update_attributes(flow: new_forward_flow)
					backward_arc.update_attributes(flow: new_backward_flow)
				end
				@total_max_flow += max_flow
				selected_path.update_attributes(max_flow: 0)
				selected_paths[selected_paths.length] = selected_path

				update_paths_max_flow
			else
				done = true
			end
		end
	end

	def find_all_paths
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
		return paths
	end

	def save_all_paths(paths)
		paths.each do |key, array|
			path = Path.new
			for i in 0..array.length - 1
				tail = Node.where(number: array[i]).first
				head = Node.where(number: array[i + 1]).first
				path.nodes << tail
				if head
					arc = Arc.where('tail_id = ? AND head_id = ?', tail.id, head.id).first
					path.arcs << arc
				end
			end
			path.save unless path.nodes.empty? && path.arcs.empty?
			path.update_attributes(max_flow: path.arcs.minimum(:flow))
		end
	end

	def update_paths_max_flow
		paths = Path.all
		paths.each do |path|
			path_max_flow = path.arcs.minimum(:flow)
			path.update_attributes(max_flow: path_max_flow)
		end
	end
end
